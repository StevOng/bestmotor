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
    pesanan_list = Pesanan.objects.prefetch_related('detailpesanan_set').select_related('customer_id')

    if role == 'sales':
        pesanan_list = pesanan_list.filter(customer_id__user_id=user_id)

    if status:
        pesanan_list = pesanan_list.filter(status=status)

    total_pending = Pesanan.objects.filter(status='pending').count()
    total_ready = Pesanan.objects.filter(status='ready').count()

    return render(request, 'pesanan/pesanan.html', {'pesanan_list':pesanan_list, 'total_pending':total_pending, 'total_ready':total_ready})

@both_required
def tambah_pesanan(request, id=None):
    pesanan = None
    role = request.session.get("role")
    user_id = request.session.get("user_id")
    detail_pesanan = []
    customers = Customer.objects.all()

    if role == "sales":
        customers = Customer.objects.filter(user_id=user_id)

    if id:
        pesanan = Pesanan.objects.get(id=id)
        detail_pesanan = pesanan.detailpesanan_set.all()
        is_shipped = pesanan.status in ["ready", "shipped"]

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
        for barang in Barang.objects.all()
    }

    barang_data_json = json.dumps(barang_data_dict, cls=DjangoJSONEncoder)
    return render(
        request, 'pesanan/tambahpesan.html', 
        {
            'detail_pesanan':detail_pesanan, 
            'customers':customers, 
            'barang_data_json':barang_data_json,
            'is_shipped': is_shipped
        })