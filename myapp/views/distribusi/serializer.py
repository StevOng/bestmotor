from rest_framework import serializers
from ...models.distribusi import *

class TransaksiMasukSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransaksiMasuk
        fields = '__all__'

class TransaksiKeluarSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransaksiKeluar
        fields = '__all__'