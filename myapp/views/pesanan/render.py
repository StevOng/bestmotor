from django.shortcuts import render
from django.core.serializers.json import DjangoJSONEncoder
from ...decorators import both_required
from ...models.pesanan import *
from ...models.customer import Customer
import json

@both_required
def pesanan(request):
    status = request.GET.get('status', None)
    pesanan_list = Pesanan.objects.prefetch_related('detailpesanan_set').all()
    total_pending = Pesanan.objects.filter(status='pending').count()
    total_ready = Pesanan.objects.filter(status='ready').count()

    if status:
        pesanan_list = pesanan_list.filter(status=status)

    return render(request, 'pesanan.html', {'pesanan_list':pesanan_list, 'total_pending':total_pending, 'total_ready':total_ready})

@both_required
def tambah_pesanan(request, id=None):
    pesanan = None
    detail_pesanan = []
    customers = Customer.objects.all()

    if id:
        pesanan = Pesanan.objects.get(id=id)
        detail_pesanan = pesanan.detailpesanan__set.all()

    barang_data_dict = {
        detail.barang.id: {
            "harga_jual": float(detail.barang.harga_jual),
            "harga_satuan1": float(detail.barang.harga_satuan1),
            "harga_satuan2": float(detail.barang.harga_satuan2),
            "min_qty_grosir1": detail.barang.min_qty_grosir1,
            "min_qty_grosir2": detail.barang.min_qty_grosir2,
        }
        for detail in detail_pesanan if detail.barang
    }

    barang_data_json = json.dumps(barang_data_dict, cls=DjangoJSONEncoder)
    return render(
        request, 'tambahpesan.html', 
        {
            'detail_pesanan':detail_pesanan, 
            'customers':customers, 
            'barang_data_json':barang_data_json
        })