from rest_framework import serializers
from ...models.invoice import *

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

class DetailInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetailInvoice
        fields = '__all__'