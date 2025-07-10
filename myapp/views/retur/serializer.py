from rest_framework import serializers
from django.db import transaction
from ...models.retur import *
from ...models.pesanan import *
from ...models.invoice import *

class ReturBeliBarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturBeliBarang
        fields = ['barang', 'qty', 'diskon_barang']

class ReturBeliSerializer(serializers.ModelSerializer):
    detail_barang = ReturBeliBarangSerializer(many=True, write_only=True)

    class Meta:
        model = ReturBeli
        fields = '__all__'
        extra_kwargs = {
            'no_bukti': {'required': False}
        }

    def create(self, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            retur = ReturBeli.objects.create(**validated_data)
            for item in detail_data:
                ReturBeliBarang.objects.create(retur=retur, **item)

                # Update stok
                barang = item['barang']
                barang.stok -= item['qty']
                barang.save(update_fields=["stok"])
                
                # Update qty_retur di DetailInvoice
                invoice = retur.invoice_id
                invoice.netto -= retur.subtotal
                invoice.bruto -= retur.subtotal
                invoice.sisa_bayar -= retur.subtotal
                invoice.save(update_fields=["netto", "bruto", "sisa_bayar"])
                
                try:
                    detail_invoice = DetailInvoice.objects.get(
                        invoice_id=invoice,
                        barang_id=barang
                    )
                    detail_invoice.qty_retur += item['qty']
                    detail_invoice.qty_beli -= item['qty']
                    detail_invoice.save()
                except DetailInvoice.DoesNotExist:
                    raise serializers.ValidationError(f"DetailInvoice tidak ditemukan untuk barang: {barang.nama_barang}")

        return retur

    # def update(self, instance, validated_data):
    #     detail_data = validated_data.pop('detail_barang')
    #     with transaction.atomic():
    #         # Rollback stok sebelumnya
    #         old_details = ReturBeliBarang.objects.filter(retur=instance)
    #         for old in old_details:
    #             old.barang.stok += old.qty
    #             old.barang.save()

    #         for attr, value in validated_data.items():
    #             setattr(instance, attr, value)
    #         instance.save()

    #         old_details.delete()

    #         for item in detail_data:
    #             ReturBeliBarang.objects.create(retur=instance, **item)
    #             item['barang'].stok -= item['qty']
    #             item['barang'].save()

    #     return instance

class ReturJualBarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturJualBarang
        fields = ['barang', 'qty', 'diskon_barang']

class ReturJualSerializer(serializers.ModelSerializer):
    detail_barang = ReturJualBarangSerializer(many=True, write_only=True)

    class Meta:
        model = ReturJual
        fields = '__all__'
        extra_kwargs = {
            'no_bukti': {'required': False}
        }

    def create(self, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            retur = ReturJual.objects.create(**validated_data)
            for item in detail_data:
                ReturJualBarang.objects.create(retur=retur, **item)

                barang_id = item['barang'].id if isinstance(item['barang'], Barang) else item['barang']
                barang = item['barang']
                qty_retur = item['qty']
                detail_pesanan = DetailPesanan.objects.get(pesanan_id=retur.faktur_id.pesanan_id, barang_id=barang_id)
                faktur = retur.faktur_id
                faktur.pesanan_id.netto -= retur.subtotal
                faktur.pesanan_id.bruto -= retur.subtotal
                faktur.pesanan_id.save(update_fields=["netto", "bruto"])
                
                faktur.total -= retur.subtotal
                faktur.sisa_bayar -= retur.subtotal
                faktur.save(update_fields=["total", "sisa_bayar"])

                detail_pesanan.qty_retur += qty_retur
                detail_pesanan.qty_pesan -= qty_retur
                detail_pesanan.save()
                
                barang.stok += qty_retur
                barang.save(update_fields=["stok"])
        return retur
    
    # def update(self, instance, validated_data):
    #     detail_data = validated_data.pop('detail_barang')
    #     with transaction.atomic():
    #         # Rollback stok dan qty_retur sebelumnya
    #         old_details = ReturJualBarang.objects.filter(retur=instance)
    #         # 1. Simpan qty lama sebelum dihapus
    #         qty_lama_map = {}
    #         for old in old_details:
    #             barang = old.barang
    #             qty_lama_map[barang.id] = qty_lama_map.get(barang.id, 0) + old.qty

    #             # rollback stok & qty_retur
    #             barang.stok -= old.qty
    #             barang.save()

    #             detail_pesanan = DetailPesanan.objects.get(
    #                 pesanan_id=instance.faktur_id.pesanan_id,
    #                 barang_id=barang.id
    #             )
    #             detail_pesanan.qty_retur -= old.qty
    #             detail_pesanan.save()

    #         # 2. Hapus setelah rollback
    #         old_details.delete()
    #         for item in detail_data:
    #             ReturJualBarang.objects.create(retur=instance, **item)

    #             barang = item['barang']
    #             qty_baru = item['qty']
    #             qty_lama = qty_lama_map.get(barang.id, 0)
    #             selisih = qty_baru  # default kalau tidak ada qty lama

    #             # 3. Update stok berdasarkan selisih
    #             selisih = qty_baru - qty_lama
    #             barang.stok += selisih
    #             barang.save()

    #             detail_pesanan = DetailPesanan.objects.get(
    #                 pesanan_id=instance.faktur_id.pesanan_id,
    #                 barang_id=barang.id
    #             )
    #             detail_pesanan.qty_retur += qty_baru
    #             detail_pesanan.save()
    
        # return instance
