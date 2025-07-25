from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import ExtractWeekDay
from datetime import date
from calendar import monthrange
from ...models.pesanan import *
from ...models.faktur import *
from .serializer import *

class PesananViewSet(viewsets.ModelViewSet):
    queryset = Pesanan.objects.all()
    serializer_class = PesananSerializer

    def get_queryset(self):
        try:
            user_id = self.request.session.get("user_id")
            user_role = self.request.session.get("role")

            if user_role == "admin":
                return Pesanan.objects.all()
            if user_id:
                return Pesanan.objects.filter(customer_id__user_id=user_id)
        except:
            pass
        return Pesanan.objects.all()  # fallback untuk debugging

    @action(detail=False, methods=['patch'])
    def update_status_bulk(self, request):
        ids = request.data.get('ids', [])
        new_status = request.data.get('status', None)

        if not ids or not new_status:
            return Response({"error":"IDs dan status harus dikirim"}, status=status.HTTP_400_BAD_REQUEST)
        for pesanan in Pesanan.objects.filter(id__in=ids):
            pesanan.status = new_status
            pesanan.save(update_fields=["status"])
        return Response({"message":"Status pesanan berhasil diperbarui"})

    @action(detail=True, methods=['patch'])
    def update_status_single(self, request, pk=None):
        pesanan = self.get_queryset().get(pk=pk)
        newStatus = request.data.get("status")

        if not newStatus or newStatus not in ["cancelled", "ready", "shipped"]:
            return Response({"message": "Status baru tidak ditemukan"}, status=status.HTTP_404_NOT_FOUND)

        pesanan.status = newStatus
        pesanan.save(update_fields=["status"])
        return Response({"message": "Status pesanan berhasil diperbarui"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['patch'])
    def cancelled(self, request, pk=None):
        pesanan = self.get_queryset().get(pk=pk)
        pesanan.status = "cancelled"
        pesanan.save()

        detail = DetailPesanan.objects.filter(pesanan_id=pesanan.id)
        for item in detail:
            barang_id = item.barang_id
            barang = Barang.objects.get(pk=barang_id)
            barang.stok += item.qty_pesan
            barang.save(update_fields=["stok"])
        return Response({"status": "cancelled"}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def top_customer(self, request):
        data = (
            Pesanan.objects
            .values('customer_id', 'customer_id__nama')
            .annotate(total_belanja=Sum('netto'))
            .order_by('-total_belanja')[:3]
        )

        result = [
            {
                'customer': d['customer_id__nama'],
                'total_belanja': d['total_belanja']
            }
            for d in data
        ]
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def income(self, request):
        bulan = request.GET.get('bulan', 'Januari')
        minggu = int(request.GET.get('minggu', 1))

        bulan_map = {
            'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
            'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
            'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
        }

        month_number = bulan_map.get(bulan, 1)

        year = date.today().year
        days_in_month = monthrange(year, month_number)[1]

        start_day = (minggu - 1) * 7 + 1
        end_day = min(start_day + 6, days_in_month)

        filter_start = date(year, month_number, start_day)
        filter_end = date(year, month_number, end_day)

        queryset = Pesanan.objects.filter(
            tanggal_pesanan__date__range=[filter_start, filter_end]
        ).annotate(
            weekday=ExtractWeekDay('tanggal_pesanan')
        ).values('weekday').annotate(
            total=Sum('netto'),
            count=Count('id')
        )

        weekday_map = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
        data_dict = {day: 0 for day in weekday_map}

        for item in queryset:
            # ExtractWeekDay: 1=Sunday ... 7=Saturday
            index = (item['weekday'] + 5) % 7 # convert to 0=Senin, 6=Minggu
            # gunakan 'total' sesuai alias annotate(...)
            data_dict[weekday_map[index]] = float(item['total']) / 1_000_000

        total_income  = sum(item['total'] for item in queryset)
        total_orders = sum(item['count'] for item in queryset)

        return Response({
            "categories": weekday_map,
            "values": [data_dict[day] for day in weekday_map],
            "total_income": total_income,
            "total_orders": total_orders
        })
    
    @action(detail=False, methods=['get'])
    def kurir_choices(self, request):
        choices = [{'value': value, 'label': label} for value, label in Pesanan.KURIR]
        return Response(choices)

class DetailPesananViewSet(viewsets.ModelViewSet):
    queryset = DetailPesanan.objects.all()
    serializer_class = DetailPesananSerializer

    @action(detail=False, methods=["get"], url_path="retur_info")
    def retur_info(self, request, pk=None):
        pesanan_id = request.query_params.get("pesanan_id")
        barang_id = request.query_params.get("barang_id")

        if not pesanan_id or not barang_id:
            return Response({"error": "pesanan_id dan barang_id dibutuhkan"}, status=400)

        detail = DetailPesanan.objects.filter(
            pesanan_id=pesanan_id,
            barang_id=barang_id
        ).first()

        if not detail:
            return Response({"error": "Data tidak ditemukan"}, status=404)

        data = {
            "qty_pesan": detail.qty_pesan,
            "qty_retur": detail.qty_retur or 0
        }
        return Response(data)
    
    @action(detail=False, methods=["get"], url_path="by_faktur/(?P<faktur_id>\d+)/(?P<barang_id>\d+)")
    def by_faktur(self, request, faktur_id=None, barang_id=None):
        try:
            faktur = Faktur.objects.get(id=faktur_id)
            pesanan = faktur.pesanan_id
            detail = DetailPesanan.objects.select_related("barang_id").get(pesanan_id=pesanan, barang_id=barang_id)
            data = {
                "nama_barang": detail.barang_id.nama_barang,
                "harga_jual": detail.barang_id.harga_jual,
                "diskon_barang": float(detail.diskon_barang),
                "qty_retur": detail.qty_retur or 0,
                "total_diskon_barang": float(detail.total_diskon_barang()),
                "total_harga_barang": float(detail.total_harga_barang())
            }
            return Response(data)
        except DetailPesanan.DoesNotExist:
            return Response({"error": "Detail tidak ditemukan"}, status=404)