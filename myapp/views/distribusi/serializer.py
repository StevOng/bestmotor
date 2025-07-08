from rest_framework import serializers
from django.db import transaction
from ...models.distribusi import *

class TransaksiMasukBarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransaksiMasukBarang
        fields = ['barang', 'qty']

class TransaksiMasukSerializer(serializers.ModelSerializer):
    detail_barang = TransaksiMasukBarangSerializer(many=True, write_only=True)

    class Meta:
        model = TransaksiMasuk
        fields = '__all__'
        extra_kwargs = {
            'no_bukti': {'required': False}
        }

    def create(self, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            transaksi = TransaksiMasuk.objects.create(**validated_data)
            for item in detail_data:
                TransaksiMasukBarang.objects.create(transaksi=transaksi, **item)

                barang_id = item['barang'].id if isinstance(item['barang'], Barang) else item['barang']
                barang_masuk = item['qty']
                barang = Barang.objects.get(id=barang_id)
                barang.stok += barang_masuk
                barang.save(update_fields=['stok'])
        return transaksi
    
    def update(self, instance, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            TransaksiMasukBarang.objects.filter(transaksi=instance).delete()

            for item in detail_data:
                TransaksiMasukBarang.objects.create(transaksi=instance, **item)
        return instance

class TransaksiKeluarBarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransaksiKeluarBarang
        fields = ['barang', 'qty']

class TransaksiKeluarSerializer(serializers.ModelSerializer):
    detail_barang = TransaksiKeluarBarangSerializer(many=True, write_only=True)

    class Meta:
        model = TransaksiKeluar
        fields = '__all__'
        extra_kwargs = {
            'no_bukti': {'required': False}
        }

    def create(self, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            transaksi = TransaksiKeluar.objects.create(**validated_data)
            for item in detail_data:
                TransaksiKeluarBarang.objects.create(transaksi=transaksi, **item)

                barang_id = item['barang'].id if isinstance(item['barang'], Barang) else item['barang']
                barang_keluar = item['qty']
                barang = Barang.objects.get(id=barang_id)
                barang.stok -= barang_keluar
                barang.save(update_fields=['stok'])
        return transaksi
    
    def update(self, instance, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            TransaksiKeluarBarang.objects.filter(transaksi=instance).delete()

            for item in detail_data:
                TransaksiKeluarBarang.objects.create(transaksi=instance, **item)
        return instance