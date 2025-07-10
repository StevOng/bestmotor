from django.shortcuts import render
from django.db.models import Sum
from myapp.utils.decorators import admin_required, both_required
from myapp.utils.activity_logs import activity_logs
from ...models.piutang import *
from ...models.faktur import Faktur
from ...models.user import User

@admin_required
@activity_logs
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
@activity_logs
def tambah_bayarpiutang(request, id=None):
    sales   = User.objects.all()
    faktur  = Faktur.objects.filter(
        status__in=['belum_lunas', 'jatuh_tempo']
    ).select_related('pesanan_id__customer_id__user_id')

    data_piutang = None
    daftar_pf = []

    if id:
        data_piutang = Piutang.objects.select_related("customer_id__user_id").get(id=id)
        # ambil semua baris PiutangFaktur, sekaligus kostumisasi prefetch Faktur
        daftar_pf = PiutangFaktur.objects.filter(piutang=data_piutang)\
                         .select_related("faktur__pesanan_id__customer_id")
        
        total_faktur = daftar_pf.aggregate(
            total=Sum('faktur__total')
        )['total'] or 0

        data_piutang.total_faktur = total_faktur
    return render(request, 'piutang/tambahpiutang.html', {
        'data_piutang': data_piutang,
        'data_pf': daftar_pf, 
        'data_faktur': faktur,
        'list_sales': sales,
    })