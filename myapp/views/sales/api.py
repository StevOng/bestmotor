from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .serializer import *
from ...models.bonus import *
from decimal import Decimal

class BonusViewSet(viewsets.ModelViewSet):
    queryset = Bonus.objects.all()
    serializer_class = BonusSerializer

    def create_sales_bonus(self):
        user_id = self.request.session.get("user_id")
        user = User.objects.get(id=user_id)

        if user.role != "sales":
            raise PermissionDenied("Hanya sales yang mendapat bonus")

        # Ambil semua pesanan "shipped" milik sales yg belum pernah masuk ke BonusDetail
        pesanan_list = Pesanan.objects.filter(
            status="shipped",
            customer_id__user_id=user_id
        ).exclude(
            id__in=BonusDetail.objects.values_list("pesanan_id", flat=True)
        )

        if not pesanan_list.exists():
            raise ValueError("Tidak ada pesanan shipped dari sales ini")

        detailpesanan = DetailPesanan.objects.filter(
            pesanan_id__in=pesanan_list
        ).select_related("barang_id")

        persen_sales = PersenBonus.objects.all()
        total_bonus = Decimal('0.00')

        # Cek apakah sudah ada Bonus yang aktif (belum dicairkan) untuk user ini
        bonus = Bonus.objects.filter(user_id=user, tanggal_cair__isnull=True).first()

        # Kalau belum ada, buat baru
        if not bonus:
            bonus = Bonus.objects.create(user_id=user)

        for detail in detailpesanan:
            barang = detail.barang_id
            persen_bonus = persen_sales.filter(merk_nama__iexact=barang.merk).first()

            if persen_bonus:
                persenan = persen_bonus.persenan
            else:
                persenan = Decimal('0.00')
                persen_bonus = None

            nilai_bonus = detail.total_harga_barang() * (persenan / Decimal('100'))

            # Tambahkan detail bonus
            BonusDetail.objects.create(
                bonus_id=bonus,
                persen_bonus=persen_bonus,
                pesanan_id=detail.pesanan_id,
                detail_pesanan_id=detail,
                merk=barang.merk,
                nama_barang=barang.nama_barang,
                qty=detail.qty_pesan,
                harga=barang.get_harga_berdasarkan_qty(detail.qty_pesan),
                nilai_bonus=nilai_bonus
            )

            total_bonus += nilai_bonus

        # Update total_bonus
        bonus.total_bonus = (bonus.total_bonus or Decimal('0.00')) + total_bonus
        bonus.save()

        return bonus
    
    @action(detail=False, methods=['get'], url_path='bonus-detail')
    def bonus_detail(self, request):
        bonus_id = request.query_params.get("bonus_id")

        if not bonus_id:
            return Response({"success": False, "message": "bonus_id is required"}, status=400)

        print("Request received for bonus_id:", bonus_id)
        bonus = get_object_or_404(Bonus, id=bonus_id)

        bonus_detail_qs = BonusDetail.objects.filter(bonus_id=bonus).select_related("persen_bonus")
        data = []

        for d in bonus_detail_qs:
            data.append({
                "nama_barang": d.nama_barang,
                "merk": d.merk,
                "persen_bonus": d.persen_bonus.persenan if d.persen_bonus else None,
                "qty": d.qty,
                "harga": d.harga,
                "nilai_bonus": d.nilai_bonus,
            })

        return Response({"success": True, "data": data})

class BonusDetailViewSet(viewsets.ModelViewSet):
    queryset = BonusDetail.objects.all()
    serializer_class = BonusDetailSerializer

class PersenBonusViewSet(viewsets.ModelViewSet):
    queryset = PersenBonus.objects.all()
    serializer_class = PersenBonusSerializer