from rest_framework import serializers
from django.db import transaction
from ...models.piutang import *


class PiutangFakturSerializer(serializers.ModelSerializer):
    class Meta:
        model = PiutangFaktur
        fields = ['faktur', 'nilai_bayar']

class PiutangSerializer(serializers.ModelSerializer):
    list_faktur = PiutangFakturSerializer(many=True, write_only=True)

    class Meta:
        model = Piutang
        fields = '__all__'
        extra_kwargs = {
            'no_bukti': {'required': False}
        }

    def create(self, validated_data):
        list_data = validated_data.pop("list_faktur")
        with transaction.atomic():
            piutang = Piutang.objects.create(**validated_data)
            for item in list_data:
                PiutangFaktur.objects.create(piutang=piutang, **item)

            piutang.total_potongan  = piutang.potongan_total()
            piutang.total_pelunasan = piutang.pelunasan_total()
            piutang.save(update_fields=['total_potongan','total_pelunasan'])
        return piutang
    
    def update(self, instance, validated_data):
        list_data = validated_data.pop("list_faktur")
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if list_data is not None:
                PiutangFaktur.objects.filter(piutang=instance).delete()
                for item in list_data:
                    PiutangFaktur.objects.create(piutang=instance, **item)

                instance.total_potongan  = instance.potongan_total()
                instance.total_pelunasan = instance.pelunasan_total()
                instance.save(update_fields=['total_potongan','total_pelunasan'])
        return instance