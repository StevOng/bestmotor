from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from django.db.models.functions import ExtractWeekDay
from django.db.models import Sum, Count
from datetime import date
from calendar import monthrange
from ...models.invoice import *
from .serializer import *

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        return Invoice.objects.all()

    @action(detail=False, methods=['get'])
    def expenses(self, request):
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

        # Minggu ke-n (1-4)
        start_day = (minggu - 1) * 7 + 1
        end_day = min(start_day + 6, days_in_month)

        filter_start = date(year, month_number, start_day)
        filter_end = date(year, month_number, end_day)

        queryset = Invoice.objects.filter(
            tanggal__date__range=[filter_start, filter_end]
        ).annotate(
            weekday=ExtractWeekDay('tanggal')
        ).values('weekday').annotate(
            total=Sum('netto'),
            count=Count('id')
        )

        weekday_map = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
        data_dict = {day: 0 for day in weekday_map}

        for item in queryset:
            # ExtractWeekDay: 1=Sunday ... 7=Saturday
            index = (item['weekday'] + 5) % 7  # convert to 0=Senin, 6=Minggu
            data_dict[weekday_map[index]] = float(item['netto']) / 1_000_000  # juta

        total_pengeluaran = sum(item['netto'] for item in queryset)
        total_transaksi = sum(item['count'] for item in queryset)

        return Response({
            "categories": weekday_map,
            "values": [data_dict[day] for day in weekday_map],
            "total_pengeluaran": total_pengeluaran,
            "total_transaksi": total_transaksi
        })
    
    @action(detail=True, methods=['delete'])
    def delete(self, request, pk=None):
        invoice = self.get_queryset().get(pk=pk)

        detail = DetailInvoice.objects.filter(invoice_id=invoice.id)
        for item in detail:
            barang_id = item.barang_id
            barang = Barang.objects.get(pk=barang_id.pk)
            barang.stok -= item.qty_beli
            barang.save(update_fields=["stok"])
        invoice.delete()
        return Response({"status": "deleted"})
    
    @action(detail=False, methods=['get'], url_path='by_supplier/(?P<supplier_id>[^/.]+)')
    def by_supplier(self, request, supplier_id=None):
        invoices = Invoice.objects.filter(supplier_id=supplier_id, status__in=["belum_lunas", "jatuh_tempo"])
        data = [
            {
                "id": inv.id,
                "no_invoice": inv.no_invoice,
                "tanggal": inv.tanggal,
                "netto": float(inv.netto),
                "status": inv.status
            }
            for inv in invoices
        ]
        return Response(data)
    
    @action(detail=True, methods=['get'], url_path='data')
    def get_invoice_data(self, request, pk=None):
        try:
            invoice = Invoice.objects.get(pk=pk)
            return Response({
                "no_invoice": invoice.no_invoice,
                "tanggal": invoice.tanggal,
                "no_referensi": invoice.no_referensi,
                "netto": float(invoice.netto),
                "bruto": float(invoice.bruto),
                "diskon_invoice": float(invoice.diskon_invoice or 0),
                "ongkir": float(invoice.ongkir or 0),
                "ppn": float(invoice.ppn or 0),
            })
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice tidak ditemukan"}, status=404)

class DetailInvoiceViewSet(viewsets.ModelViewSet):
    queryset = DetailInvoice.objects.all()
    serializer_class = DetailInvoiceSerializer

    @action(detail=False, methods=['get'], url_path="get_qty_info")
    def get_qty_info(self, request, pk=None):
        invoice_id = request.query_params.get("invoice_id")
        barang_id = request.query_params.get("barang_id")
        
        if not invoice_id or not barang_id:
            return Response({"error": "invoice_id dan barang_id dibutuhkan"}, status=400)
        
        try:
            detail = DetailInvoice.objects.get(invoice_id=invoice_id, barang_id=barang_id)
            return Response({
                "qty_beli": detail.qty_beli,
                "qty_retur": detail.qty_retur
            })
        except DetailInvoice.DoesNotExist:
            return Response({"error": "Data tidak ditemukan"}, status=404)