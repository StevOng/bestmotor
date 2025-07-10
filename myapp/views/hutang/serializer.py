from rest_framework import serializers
from django.db import transaction
from ...models.hutang import *

class HutangInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HutangInvoice
        fields = ['invoice', 'nilai_bayar', 'potongan']

class HutangSerializer(serializers.ModelSerializer):
    list_invoice = HutangInvoiceSerializer(many=True, write_only=True)

    class Meta:
        model = Hutang
        fields = '__all__'
        extra_kwargs = {
            'no_bukti': {'required': False, 'allow_blank': True}
        }

    def create(self, validated_data):
        arr = validated_data.pop("list_invoice",[])
        with transaction.atomic():
            hut = Hutang.objects.create(**validated_data)
            for it in arr:
                hi = HutangInvoice.objects.create(
                    hutang=hut,
                    invoice=it["invoice"],
                    nilai_bayar=it["nilai_bayar"],
                    potongan=it.get("potongan", 0)
                )
                inv = hi.invoice
                total_diterima = hi.nilai_bayar + hi.potongan
                inv.sisa_bayar = max(inv.sisa_bayar - total_diterima, 0)
                inv.status = "lunas" if inv.sisa_bayar==0 else "belum_lunas"
                inv.save(update_fields=["sisa_bayar","status"])
            # recalc totals di header
            hut.total_potongan  = hut.potongan_total()
            hut.total_pelunasan = hut.pelunasan_total()
            hut.save(update_fields=["total_potongan","total_pelunasan"])
        return hut

    def update(self, instance, validated_data):
        arr = validated_data.pop("list_invoice",None)
        with transaction.atomic():
            for k,v in validated_data.items():
                setattr(instance,k,v)
            instance.save()
            if arr is not None:
                # rollback old
                for old in HutangInvoice.objects.filter(hutang=instance):
                    inv = old.invoice
                    inv.sisa_bayar += old.nilai_bayar
                    inv.status = "belum_lunas"
                    inv.save(update_fields=["sisa_bayar","status"])
                HutangInvoice.objects.filter(hutang=instance).delete()
                # apply new
                for it in arr:
                    hi = HutangInvoice.objects.create(
                        hutang=instance,
                        invoice=it["invoice"],
                        nilai_bayar=it["nilai_bayar"],
                        potongan=it.get("potongan", 0)
                    )
                    inv = hi.invoice
                    total_diterima = hi.nilai_bayar + hi.potongan
                    inv.sisa_bayar = max(inv.sisa_bayar - total_diterima, 0)
                    inv.status = "lunas" if inv.sisa_bayar==0 else "belum_lunas"
                    inv.save(update_fields=["sisa_bayar","status"])
            # recalc totals
            instance.total_potongan  = instance.potongan_total()
            instance.total_pelunasan = instance.pelunasan_total()
            instance.save(update_fields=["total_potongan","total_pelunasan"])
        return instance