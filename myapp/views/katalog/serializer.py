from rest_framework import serializers
from ...models.katalog import Katalog

class KatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Katalog
        fields = '__all__'