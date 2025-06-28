from rest_framework import viewsets
from .serializer import *
from ...models.bonus import *
from decimal import Decimal

class BonusViewSet(viewsets.ModelViewSet):
    queryset = Bonus.objects.all()
    serializer_class = BonusSerializer

    def create_sales_bonus(self):
        user_id = self.request.session.get("user_id")
        pesanan_list = Pesanan.objects.filter(status="ready", customer_id__user_id=user_id)

        if not pesanan_list:
            raise ValueError("Tidak ada pesanan ready dari sales ini")
        
        detailpesanan = DetailPesanan.objects.filter(pesanan_id__in=pesanan_list).select_related("barang_id")
        persen_sales = PersenBonus.objects.all()
        total_bonus = Decimal('0.00')
        bonus = Bonus.objects.create(
            user_id = user_id,
        )
        for detail in detailpesanan:
            barang = detail.barang_id
            try:
                persen_bonus = persen_sales.get(barang_id=barang)
                persenan = persen_bonus.persenan
            except PersenBonus.DoesNotExist:
                persenan = Decimal('0.00')
                persen_bonus = None
            nilai_bonus = detail.total_harga_barang() * (persenan / Decimal('100'))

            BonusDetail.objects.create(
                bonus_id = bonus,
                persen_bonus = persen_bonus if persen_bonus else None,
                pesanan_id = detail.pesanan_id,
                detail_pesanan_id = detail,
                merk = detail.barang_id.merk,
                nama_barang = detail.barang_id.nama_barang,
                qty = detail.qty_pesan,
                harga = detail.barang_id.get_harga_berdasarkan_qty(detail.qty_pesan),
                nilai_bonus = nilai_bonus
            )
            total_bonus += nilai_bonus
        bonus.total_bonus = total_bonus
        bonus.save()
        return bonus

class BonusDetailViewSet(viewsets.ModelViewSet):
    queryset = BonusDetail.objects.all()
    serializer_class = BonusDetailSerializer