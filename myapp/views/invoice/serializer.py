from rest_framework import serializers
from django.db import transaction
from ...models.invoice import *

class DetailInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetailInvoice
        fields = ['barang_id', 'qty_beli', 'harga_beli', 'diskon_barang']

class InvoiceSerializer(serializers.ModelSerializer):
    detail_barang = DetailInvoiceSerializer(many=True, write_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'

    def create(self, validated_data):
        detail_data = validated_data.pop('detail_barang')
        with transaction.atomic():
            invoice = Invoice.objects.create(**validated_data)
            for item in detail_data:
                DetailInvoice.objects.create(invoice_id=invoice.id, **item)

                barang_id = item['barang_id'].id if isinstance(item['barang_id'], Barang) else item['barang_id']
                dibeli = item['qty_beli']
                barang = Barang.objects.get(id=barang_id)
                barang.stok += dibeli
                barang.save()
        return invoice

    def update(self, instance, validated_data):
        list_data = validated_data.pop("detail_barang")
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.sisa_bayar = instance.netto - instance.potongan
            if instance.sisa_bayar <= 0:
                instance.status = "lunas"
            else:
                instance.status = "belum_lunas"
            instance.save()

            DetailInvoice.objects.filter(invoice_id=instance).delete()

            for item in list_data:
                DetailInvoice.objects.create(invoice_id=instance, **item)
        return instance