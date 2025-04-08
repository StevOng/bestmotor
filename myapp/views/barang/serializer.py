import base64
from rest_framework import serializers
from ...models.barang import *

class BarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barang
        fields = '__all__'

class DetailBarangSerializer(serializers.ModelSerializer):
    gambar = serializers.SerializerMethodField()
    
    class Meta:
        model = DetailBarang
        fields = '__all__'

    def get_gambar(self,obj):
        if obj.gambar:
            return "data:image/jpeg;base64," + base64.b64encode(obj.gambar).decode("utf-8")
        return None 

    def create(self, validated_data):
        gambar = validated_data.pop("gambar",None) # simpan gambar dalam bentuk biner
        if gambar:
            validated_data["gambar"] = gambar.read() # baca data biner
        return super().create(validated_data)