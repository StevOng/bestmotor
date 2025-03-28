from rest_framework import serializers
from ...models.hutang import Hutang

class HutangSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hutang
        fields = '__all__'