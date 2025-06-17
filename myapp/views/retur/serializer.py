from rest_framework import serializers
from django.db import transaction
from ...models.retur import *
from ...models.pesanan import *
from ...models.invoice import *

class ReturBeliBarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturBeliBarang
        fields = ['barang', 'qty']

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

                barang_id = item['barang'].id if isinstance(item['barang'], Barang) else item['barang']
                qty_retur = item['qty']
                detail_invoice = DetailInvoice.objects.get(invoice_id=retur.invoice_id, barang_id=barang_id)

                detail_invoice.qty_beli -= qty_retur
                detail_invoice.qty_retur += qty_retur
                detail_invoice.save()
        return retur
    
    def update(self, instance, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            ReturBeliBarang.objects.filter(retur=instance).delete()

            for item in detail_data:
                ReturBeliBarang.objects.create(retur=instance, **item)
        return instance

class ReturJualBarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturJualBarang
        fields = ['barang', 'qty']

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
                qty_retur = item['qty']
                detail_pesanan = DetailPesanan.objects.get(pesanan_id=retur.faktur_id.pesanan_id, barang_id=barang_id)

                detail_pesanan.qty_pesan -= qty_retur
                detail_pesanan.qty_retur += qty_retur
                detail_pesanan.save()
        return retur
    
    def update(self, instance, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            ReturJualBarang.objects.filter(retur=instance).delete()

            for item in detail_data:
                ReturJualBarang.objects.create(retur=instance, **item)
        return instance