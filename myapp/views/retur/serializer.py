from rest_framework import serializers
from django.db import transaction
from ...models.retur import *

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