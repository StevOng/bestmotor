from rest_framework import serializers
from ...models.pesanan import *

class PesananSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pesanan
        fields = '__all__'

class DetailPesananSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetailPesanan
        fields = '__all__'