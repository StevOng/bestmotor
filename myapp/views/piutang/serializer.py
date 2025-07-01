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
                pf = PiutangFaktur.objects.create(
                    piutang=piutang,
                    faktur_id=item["faktur"],      # pakai faktur_id langsung
                    nilai_bayar=item["nilai_bayar"]
                )

                faktur = pf.faktur
                faktur.sisa_bayar = max(faktur.sisa_bayar - pf.nilai_bayar, 0)
                faktur.status = "lunas" if faktur.sisa_bayar == 0 else "belum_lunas"
                faktur.save(update_fields=["sisa_bayar", "status"])

            # 3) hitung ulang summary di header
            piutang.total_potongan  = piutang.potongan_total()
            piutang.total_pelunasan = piutang.pelunasan_total()
            piutang.save(update_fields=["total_potongan","total_pelunasan"])

        return piutang
    
    def update(self, instance, validated_data):
        list_data = validated_data.pop("list_faktur", None)
        with transaction.atomic():
            # 1) update field‐field header
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if list_data is not None:
                # 2) rollback pembayaran lama ke Faktur
                old_pfs = PiutangFaktur.objects.filter(piutang=instance)
                for old in old_pfs:
                    faktur = old.faktur
                    print(faktur.sisa_bayar, old.nilai_bayar)
                    faktur.sisa_bayar += old.nilai_bayar
                    faktur.status = "belum_lunas"
                    faktur.save(update_fields=["sisa_bayar", "status"])
                old_pfs.delete()

                # 3) simpan pembayaran baru & update Faktur
                for item in list_data:
                    pf = PiutangFaktur.objects.create(piutang=instance, **item)
                    faktur = pf.faktur
                    faktur.sisa_bayar -= pf.nilai_bayar
                    print(faktur.sisa_bayar, pf.nilai_bayar)
                    faktur.status = "lunas" if faktur.sisa_bayar == 0 else "belum_lunas"
                    faktur.save(update_fields=["sisa_bayar", "status"])

                # 4) hitung ulang totals di Piutang
                instance.total_potongan  = instance.potongan_total()
                instance.total_pelunasan = instance.pelunasan_total()
                instance.save(update_fields=["total_potongan", "total_pelunasan"])

        return instance