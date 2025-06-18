from rest_framework import serializers
from ...models.invoice import *

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

    def update(self, instance, validated_data):
        instance.potongan = validated_data.get("potongan", instance.potongan)
        instance.sisa_bayar = instance.netto - instance.potongan

        if instance.sisa_bayar <= 0:
            instance.status = "lunas"
        else:
            instance.status = "belum_lunas"

        instance.save()
        return instance

class DetailInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetailInvoice
        fields = '__all__'