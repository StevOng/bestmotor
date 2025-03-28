from rest_framework import serializers
from ...models.retur import *

class ReturBeliSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturBeli
        fields = '__all__'

class ReturJualSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturJual
        fields = '__all__'