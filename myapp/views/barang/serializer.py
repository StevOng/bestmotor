from rest_framework import serializers
from ...models.barang import *

class BarangSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barang
        fields = '__all__'
        extra_kwargs = {
            'gambar': {'required': False, 'allow_null': True}
        }

class TierHargaSerializer(serializers.ModelSerializer):
    gambar = serializers.SerializerMethodField()
    
    class Meta:
        model = TierHarga
        fields = '__all__'