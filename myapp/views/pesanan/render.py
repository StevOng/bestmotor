from django.shortcuts import render
from django.core.serializers.json import DjangoJSONEncoder
from myapp.utils.decorators import both_required
from myapp.utils.control_access import pesanan_control_access
from myapp.utils.activity_logs import activity_logs
from ...models.pesanan import *
from ...models.customer import Customer
import json

@both_required
@activity_logs
def pesanan(request):
    status = request.GET.get('status', None)
    role = request.session.get('role')
    user_id = request.session.get('user_id')

    response = pesanan_control_access(request, None)
    if response:
        return response

    pesanan_list = Pesanan.objects.prefetch_related('detailpesanan_set').select_related('customer_id__user_id')

    if role == 'sales':
        pesanan_list = pesanan_list.filter(customer_id__user_id=user_id)

    if status:
        pesanan_list = pesanan_list.filter(status=status)

    total_pending = Pesanan.objects.filter(status='pending', customer_id__user_id=user_id).count()
    total_ready = Pesanan.objects.filter(status='ready', customer_id__user_id=user_id).count()

    return render(request, 'pesanan/pesanan.html', {'pesanan_list':pesanan_list, 'total_pending':total_pending, 'total_ready':total_ready})


@both_required
@activity_logs
def tambah_pesanan(request, id=None):
    pesanan = None
    is_shipped = None
    detail = []
    role = request.session.get("role")
    user_id = request.session.get("user_id")
    customers = Customer.objects.all()

    response = pesanan_control_access(request, id)
    if response:
        return response

    if role == "sales":
        customers = Customer.objects.filter(user_id=user_id)

    if id:
        pesanan = Pesanan.objects.prefetch_related("detailpesanan_set__barang_id").select_related("customer_id").get(id=id)
        detail = pesanan.detailpesanan_set.all()
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
            'detail_pesanan':pesanan,
            'detail_pesan': detail, 
            'customers':customers, 
            'barang_data_json':barang_data_json,
            'is_shipped': is_shipped
        })