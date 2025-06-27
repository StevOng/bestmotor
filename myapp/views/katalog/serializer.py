from rest_framework import serializers
from ...models.katalog import *

class KatalogBarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = KatalogBarang
        fields = '__all__'

class KatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Katalog
        fields = '__all__'