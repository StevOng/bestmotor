from rest_framework import serializers
from ...models.faktur import Faktur

class FakturSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faktur
        fields = '__all__'