from django.shortcuts import render
from django.core.serializers.json import DjangoJSONEncoder
from ...decorators import both_required
from ...models.pesanan import *
from ...models.customer import Customer
import json

@both_required
def pesanan(request):
    status = request.GET.get('status', None)
    role = request.session.get('role')
    user_id = request.session.get('user_id')
    pesanan_list = Pesanan.objects.prefetch_related('detailpesanan_set')

    if role == 'sales':
        pesanan_list = pesanan_list.filter(customer_id__sales_id=user_id)

    if status:
        pesanan_list = pesanan_list.filter(status=status)

    total_pending = Pesanan.objects.filter(status='pending').count()
    total_ready = Pesanan.objects.filter(status='ready').count()

    return render(request, 'pesanan/pesanan.html', {'pesanan_list':pesanan_list, 'total_pending':total_pending, 'total_ready':total_ready})

@both_required
def tambah_pesanan(request, id=None):
    pesanan = None
    detail_pesanan = []
    customers = Customer.objects.all()

    if id:
        pesanan = Pesanan.objects.get(id=id)
        detail_pesanan = pesanan.detailpesanan_set.all()

    barang_data_dict = {
        detail.barang_id: {
            "harga_jual": float(detail.barang_id.harga_jual),
            "harga_satuan": float(detail.barang_id.harga_satuan),
            "min_qty_grosir": detail.barang_id.min_qty_grosir,
        }
        for detail in detail_pesanan if detail.barang_id
    }

    barang_data_json = json.dumps(barang_data_dict, cls=DjangoJSONEncoder)
    return render(
        request, 'pesanan/tambahpesan.html', 
        {
            'detail_pesanan':detail_pesanan, 
            'customers':customers, 
            'barang_data_json':barang_data_json
        })