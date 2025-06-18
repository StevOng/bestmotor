from rest_framework import serializers
from django.db import transaction
from ...models.hutang import *

class HutangInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HutangInvoice
        fields = ['invoice', 'nilai_bayar']

class HutangSerializer(serializers.ModelSerializer):
    list_invoice = HutangInvoiceSerializer(many=True, write_only=True)

    class Meta:
        model = Hutang
        fields = '__all__'

    def create(self, validated_data):
        list_data = validated_data.pop("list_invoice")
        with transaction.atomic():
            hutang = Hutang.objects.create(**validated_data)
            for item in list_data:
                HutangInvoice.objects.create(hutang=hutang, **item)
        return hutang
    
    def update(self, instance, validated_data):
        list_data = validated_data.pop("list_invoice")
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            HutangInvoice.objects.filter(hutang=instance).delete()

            for item in list_data:
                HutangInvoice.objects.create(hutang=instance, **item)
        return instance