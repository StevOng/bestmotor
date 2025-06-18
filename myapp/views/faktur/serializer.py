from rest_framework import serializers
from ...models.faktur import Faktur

class FakturSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faktur
        fields = '__all__'

    def update(self, instance, validated_data):
        instance.potongan = validated_data.get("potongan", instance.potongan)
        instance.sisa_bayar = instance.total - instance.potongan

        if instance.sisa_bayar <= 0:
            instance.status = "lunas"
        else:
            instance.status = "belum_lunas"

        instance.save()
        return instance