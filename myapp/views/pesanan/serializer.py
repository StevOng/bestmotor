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

    def create(self, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            pesanan = Pesanan.objects.create(**validated_data)
            for item in detail_data:
                DetailPesanan.objects.create(pesanan_id=pesanan.id, **item)

                barang_id = item['barang_id'].id if isinstance(item['barang_id'], Barang) else item['barang_id']
                dipesan = item['qty_pesan']
                barang = Barang.objects.get(id=barang_id)

                barang.stok -= dipesan
                barang.save()
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