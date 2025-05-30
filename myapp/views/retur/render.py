from django.shortcuts import render
from django.core.serializers.json import DjangoJSONEncoder
from ...decorators import *
from ...models.retur import *
from ...models.invoice import *
from ...models.faktur import Faktur
import json

@both_required
def retur_jual(request):
    returan = ReturJual.objects.select_related("faktur_id__pesanan_id__customer_id")
    return render(request, 'retur/returjual.html', {'returan': returan})

@both_required
def tambah_returjual(request, id=None):
    faktur = Faktur.objects.select_related("pesanan_id__customer_id").filter(status__in=['belum_lunas','jatuh_tempo'])
    returan = None

    if id:
        returan = ReturJual.objects.select_related("faktur_id__pesanan_id__customer_id").prefetch_related(
            "pesanan_id__detailpesanan_set__barang_id"
        ).get(id=id)

    barang_data_dict = {
        detail.barang_id: {
            "harga_jual": float(detail.barang.harga_jual),
            "tier_harga": [
                {
                    "harga_satuan": float(tier.harga_satuan),
                    "min_qty_grosir": tier.min_qty_grosir,
                }
                for tier in detail.barang.tierharga_set.all().order_by('min_qty_grosir')
            ]
        }
        for detail in returan.barang.all()
    }

    barang_data_json = json.dumps(barang_data_dict, cls=DjangoJSONEncoder)
    return render(request, 'retur/tambahreturjual.html', {'returan': returan, 'faktur': faktur, 'barang_data_json': barang_data_json})

@admin_required
def retur_beli(request):
    returan = ReturBeli.objects.select_related("invoice_id__supplier_id")
    return render(request, 'retur/returbeli.html', {'returan': returan})

@admin_required
def tambah_returbeli(request, id=None):
    invoice = Invoice.objects.select_related("supplier_id").filter(status__in=['belum_lunas','jatuh_tempo'])
    returan = None

    if id:
        returan = ReturBeli.objects.select_related("invoice_id__supplier_id").prefetch_related(
            "invoice_id__detailinvoice_set__barang_id"
        ).get(id=id)

    barang_data_dict = {
        detail.barang_id: {
            "harga_jual": float(detail.barang.harga_jual),
            "tier_harga": [
                {
                    "harga_satuan": float(tier.harga_satuan),
                    "min_qty_grosir": tier.min_qty_grosir,
                }
                for tier in detail.barang.tierharga_set.all().order_by('min_qty_grosir')
            ]
        }
        for detail in returan.barang.all()
    }

    barang_data_json = json.dumps(barang_data_dict, cls=DjangoJSONEncoder)
    return render(request, 'retur/tambahreturbeli.html', {'returan': returan, 'invoice': invoice, 'barang_data_json': barang_data_json})