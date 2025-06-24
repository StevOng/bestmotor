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

        return pesanan

    def update(self, instance, validated_data):
        list_data = validated_data.pop("detail_barang")
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            DetailPesanan.objects.filter(pesanan_id=instance).delete()

            for item in list_data:
                DetailPesanan.objects.create(pesanan_id=instance, **item)
        return instance