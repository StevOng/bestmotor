from rest_framework import serializers
from ...models.barang import *

class BarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barang
        fields = '__all__'

class DetailBarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetailBarang
        fields = '__all__'