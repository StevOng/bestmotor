from rest_framework import serializers
from django.db import transaction
from ...models.katalog import *

class KatalogBarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = KatalogBarang
        fields = ['barang', 'gambar_pelengkap']

class KatalogSerializer(serializers.ModelSerializer):
    promosi_barang = KatalogBarangSerializer(many=True, write_only=True)

    class Meta:
        model = Katalog
        fields = '__all__'

    def create(self, validated_data):
        detail_data = validated_data.pop('promosi_barang')
        with transaction.atomic():
            katalog = Katalog.objects.create(**validated_data)
            for item in detail_data:
                KatalogBarang.objects.create(katalog=katalog.id, **item)
        return katalog
    
    def update(self, instance, validated_data):
        list_data = validated_data.pop("promosi_barang")
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            KatalogBarang.objects.filter(katalog=instance).delete()

            for item in list_data:
                KatalogBarang.objects.create(katalog=instance, **item)
        return instance