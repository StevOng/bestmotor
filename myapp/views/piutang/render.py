from django.shortcuts import render
from django.db.models import Sum
from myapp.utils.decorators import admin_required, both_required
from ...models.piutang import *
from ...models.faktur import Faktur
from ...models.user import User

@both_required
def piutang(request):
    list_piutang = Piutang.objects.select_related("customer_id__user_id")

    for p in list_piutang:
        p.total_faktur = (
            p.piutangfaktur_set
             .aggregate(total=Sum('faktur__total'))['total']
            or 0
        )
    return render(request, 'piutang/piutang.html', {'list_piutang': list_piutang})

@admin_required
def tambah_bayarpiutang(request, id=None):
    piutang = None
    sales   = User.objects.all()
    faktur  = Faktur.objects.filter(
        status__in=['belum_lunas', 'jatuh_tempo']
    ).select_related('pesanan_id__customer_id__user_id')

    piutang_obj = None
    if id:
        try:
            piutang_obj = Piutang.objects.select_related("customer_id__user_id").get(id=id)
            # hitung total_faktur & nilai_byr …
        except Piutang.DoesNotExist:
            piutang_obj = None

    # buat list yang bisa di-iter
    data_piutang = [piutang_obj] if piutang_obj else []

    return render(request, 'piutang/tambahpiutang.html', {
        'data_piutang': data_piutang,
        'data_faktur':  faktur,
        'list_sales':   sales,
    })