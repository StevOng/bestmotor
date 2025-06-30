from django.shortcuts import render
from django.db.models import Sum
from myapp.utils.decorators import admin_required, both_required
from ...models.piutang import *
from ...models.faktur import Faktur

@both_required
def piutang(request):
    list_piutang = Piutang.objects.select_related("customer_id__user_id")

    for p in list_piutang:
        p.total_faktur = p.faktur_set.aggregate(total=Sum('total'))['total'] or 0
    return render(request, 'piutang/piutang.html', {'list_piutang': list_piutang})

@admin_required
def tambah_bayarpiutang(request, id=None):
    piutang = None
    faktur = Faktur.objects.filter(status__in=['belum_lunas', 'jatuh_tempo']).select_related('pesanan_id__customer_id__user_id')

    if id:
        piutang = Piutang.objects.select_related('customer_id__user_id').get(id=id)
        piutang.total_faktur = piutang.faktur_set.aggregate(total=Sum('total'))['total'] or 0
        piutang.nilai_byr = PiutangFaktur.objects.filter(piutang=piutang).values_list('nilai_bayar', flat=True)
    return render(request, 'piutang/tambahpiutang.html', {'data_piutang':piutang, 'data_faktur': faktur})