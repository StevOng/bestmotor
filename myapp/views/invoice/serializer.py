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

                barang_id = item['barang_id'].id if isinstance(item['barang_id'], Barang) else item['barang_id']
                dibeli = item['qty_beli']
                barang = Barang.objects.get(id=barang_id)
                barang.stok += dibeli
                barang.save(update_fields=["stok"])
                DetailInvoice.objects.create(invoice_id=invoice.id, **item)
            invoice.hitung_total_bruto()
            invoice.hitung_total_netto()
            invoice.set_jatuh_tempo()
            invoice.save(update_fields=["bruto", "netto", "jatuh_tempo"])
        return invoice

    def update(self, instance, validated_data):
        list_data = validated_data.pop("detail_barang")
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            detail_lama = DetailInvoice.objects.filter(invoice_id=instance)
            for detail in detail_lama:
                barang = detail.barang_id
                barang.stok -= detail.qty_beli
                barang.save(update_fields=["stok"])
            detail_lama.delete()

            for item in list_data:
                barang_id = item['barang_id'].id if isinstance(item['barang_id'], Barang) else item['barang_id']
                barang = Barang.objects.get(id=barang_id)
    
                qty_beli = item['qty_beli']
                barang.stok -= qty_beli
                barang.save(update_fields=["stok"])
                DetailInvoice.objects.create(invoice_id=instance, **item)
            instance.hitung_total_bruto()
            instance.hitung_total_netto()
            instance.set_jatuh_tempo()
            instance.save(update_fields=["bruto", "netto", "jatuh_tempo"])
        return instance