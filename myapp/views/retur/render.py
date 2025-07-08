from django.shortcuts import render, get_object_or_404
from django.core.serializers.json import DjangoJSONEncoder
from myapp.utils.decorators import admin_required, both_required
from myapp.utils.activity_logs import activity_logs
from ...models.retur import *
from ...models.invoice import *
from ...models.faktur import Faktur
import json

@both_required
@activity_logs
def retur_jual(request):
    returan = ReturJual.objects.select_related("faktur_id__pesanan_id__customer_id")
    return render(request, 'retur/returjual.html', {'returan': returan})

@both_required
@activity_logs
def tambah_returjual(request, id=None):
    faktur = Faktur.objects.select_related("pesanan_id__customer_id").filter(status__in=['belum_lunas','jatuh_tempo']).exclude(piutangfaktur__isnull=False)
    returan = None  
    barang_data_dict = {}

    if id:
        returan = ReturJual.objects.select_related("faktur_id__pesanan_id__customer_id").prefetch_related(
            "faktur_id__pesanan_id__detailpesanan_set__barang_id"
        ).get(id=id)

        pesanan = returan.faktur_id.pesanan_id
        barang_qs = Barang.objects.filter(
            detailpesanan__pesanan_id=pesanan
        ).distinct()
    else:
        faktur_id = request.POST.get("fakturId")
        if faktur_id:
            fakturObj = get_object_or_404(Faktur, id=faktur_id)
            pesanan = fakturObj.pesanan_id
            barang_qs = Barang.objects.filter(
                detailpesanan__pesanan_id=pesanan
            ).distinct()
        else:
            barang_qs = Barang.objects.none()

    barang_data_dict = {
        barang.id: {
            "harga_jual": float(barang.harga_jual),
            "tier_harga": [
                {
                    "harga_satuan": float(tier.harga_satuan),
                    "min_qty_grosir": tier.min_qty_grosir,
                }
                for tier in barang.tierharga_set.all().order_by('min_qty_grosir')
            ]
        }
        for barang in barang_qs
    }

    barang_data_json = json.dumps(barang_data_dict, cls=DjangoJSONEncoder)
    return render(request, 'retur/tambahreturjual.html', {'returan': returan, 'faktur': faktur, 'barang_data_json': barang_data_json})

@admin_required
@activity_logs
def retur_beli(request):
    returan = ReturBeli.objects.select_related("invoice_id__supplier_id")
    return render(request, 'retur/returbeli.html', {'returan': returan})

@admin_required
@activity_logs
def tambah_returbeli(request, id=None):
    invoice = Invoice.objects.select_related("supplier_id").filter(status__in=['belum_lunas','jatuh_tempo']).exclude(hutanginvoice__isnull=False)
    print(invoice)
    returan = None

    if id:
        returan = ReturBeli.objects.select_related(
            "invoice_id__supplier_id"  # untuk ambil supplier langsung
        ).prefetch_related(
            "invoice_id__detailinvoice_set__barang_id"
        ).get(id=id)
        pembelian = returan.invoice_id
        supplier = pembelian.supplier_id  # karena field di Invoice adalah supplier_id
    else:
        invoice_id = request.POST.get("invId")
        if invoice_id:
            invoiceObj = Invoice.objects.select_related("supplier_id").get(id=invoice_id)
            pembelian = invoiceObj
            supplier = pembelian.supplier_id
        else:
            pembelian = None
            supplier = None

    detail_barang_qs = DetailInvoice.objects.filter(invoice_id=pembelian).select_related('barang_id')

    print(returan)
    return render(request, 'retur/tambahreturbeli.html', {
        'returan': returan, 
        'invoice': invoice, 
        "supplier": supplier,
        "pembelian": pembelian,
        "detail_barang_lis": detail_barang_qs
    })