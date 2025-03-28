from rest_framework import serializers
from ...models.piutang import Piutang

class PiutangSerializer(serializers.ModelSerializer):
    class Meta:
        model = Piutang
        fields = '__all__'