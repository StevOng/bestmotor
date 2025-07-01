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
        list_data = validated_data.pop("list_faktur", [])
        with transaction.atomic():
            piutang = Piutang.objects.create(**validated_data)
            for item in list_data:
                pf = PiutangFaktur.objects.create(piutang=piutang, **item)

                Faktur.objects.filter(pk=pf.faktur).update(
                    sisa_bayar=F('sisa_bayar') - pf.nilai_bayar
                )
                faktur = Faktur.objects.get(pk=pf.faktur.id)
                faktur.status = 'lunas' if faktur.sisa_bayar <= 0 else 'belum_lunas'
                faktur.save(update_fields=['status'])

            piutang.total_pelunasan = piutang.pelunasan_total()
            piutang.save(update_fields=['total_pelunasan'])
        return piutang
    
    def update(self, instance, validated_data):
        list_data = validated_data.pop("list_faktur", None)
        with transaction.atomic():
            for attr, val in validated_data.items():
                setattr(instance, attr, val)
            instance.save()
            if list_data is not None:
                old = PiutangFaktur.objects.filter(piutang=instance)

                for pf in old:
                    Faktur.objects.filter(pk=pf.faktur.id).update(
                        sisa_bayar=F('sisa_bayar') + pf.nilai_bayar
                    )
                old.delete()

                for item in list_data:
                    pf = PiutangFaktur.objects.create(piutang=instance, **item)
                    Faktur.objects.filter(pk=pf.faktur.id).update(
                        sisa_bayar=F('sisa_bayar') - pf.nilai_bayar
                    )
                    faktur = Faktur.objects.get(pk=pf.faktur.id)
                    faktur.status = 'lunas' if faktur.sisa_bayar <= 0 else 'belum_lunas'
                    faktur.save(update_fields=['status'])
                instance.total_pelunasan = instance.pelunasan_total()
                instance.save(update_fields=['total_pelunasan'])
        return instance