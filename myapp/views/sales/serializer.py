from rest_framework import serializers
from ...models.bonus import *

class BonusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bonus
        fields = '__all__'

class BonusDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BonusDetail
        fields = '__all__'

class PersenBonusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersenBonus
        fields = '__all__'