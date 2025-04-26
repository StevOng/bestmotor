from rest_framework import serializers
from ...models.katalog import Katalog

class KatalogSerializer(serializers.ModelSerializer):
    barang_nama = serializers.SerializerMethodField()
    class Meta:
        model = Katalog
        fields = '__all__'

    def get_barang_nama(self, obj):
        barang = obj.barang.all()
        return barang.nama_barang if barang else ""