from rest_framework import serializers
from django.db import transaction
from ...models.pesanan import *

class DetailPesananSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetailPesanan
        fields = ['barang_id', 'qty_pesan', 'diskon_barang']

class PesananSerializer(serializers.ModelSerializer):
    detail_barang = DetailPesananSerializer(many=True, write_only=True)

    class Meta:
        model = Pesanan
        fields = '__all__'
        extra_kwargs = {
            "no_pesanan": {"required": False}
        }

    def create(self, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            pesanan = Pesanan.objects.create(**validated_data)

            for item in detail_data:
                dipesan = item['qty_pesan']
                diskon_barang = item['diskon_barang']
                barang_obj = item['barang_id']  # bisa instance, bisa id

                # Jika bukan instance, kita jadikan instance
                if not isinstance(barang_obj, Barang):
                    barang_obj = Barang.objects.get(pk=barang_obj)

                DetailPesanan.objects.create(
                    pesanan_id=pesanan,
                    barang_id=barang_obj,
                    qty_pesan=dipesan,
                    diskon_barang=diskon_barang
                )

                barang_obj.stok -= dipesan
                barang_obj.save()

            pesanan.hitung_total_bruto()
            pesanan.hitung_total_netto()
            pesanan.set_jatuh_tempo()
            pesanan.save(update_fields=["bruto", "netto", "jatuh_tempo"])

        return pesanan

    def update(self, instance, validated_data):
        list_data = validated_data.pop("detail_barang")
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            detail_lama = DetailPesanan.objects.filter(pesanan_id=instance)
            for detail in detail_lama:
                barang = detail.barang_id
                barang.stok += detail.qty_pesan
                barang.save()
            detail_lama.delete()

            for item in list_data:
                barang_id = item['barang_id'].id if isinstance(item['barang_id'], Barang) else item['barang_id']
                barang = Barang.objects.get(id=barang_id)
    
                qty_pesan = item['qty_pesan']
                barang.stok -= qty_pesan
                barang.save()
                DetailPesanan.objects.create(pesanan_id=instance, **item)
            instance.hitung_total_bruto()
            instance.hitung_total_netto()
            instance.set_jatuh_tempo()
            instance.save(update_fields=["bruto", "netto", "jatuh_tempo"])
        return instance