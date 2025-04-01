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

    def create(self, validated_data):
        gambar = validated_data.pop("gambar",None) # simpan gambar dalam bentuk biner
        if gambar:
            validated_data["gambar"] = gambar.read() # baca data biner
        return super().create(validated_data)