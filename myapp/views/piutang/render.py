from django.shortcuts import render
from django.db.models import Sum
from ...decorators import *
from ...models.piutang import Piutang

@both_required
def piutang(request):
    list_piutang = Piutang.objects.select_related("customer_id")

    for p in list_piutang:
        p.total_faktur = p.faktur_set.aggregate(total=Sum('total'))['total'] or 0
    return render(request, 'piutang/piutang.html', {'list_piutang': list_piutang})

@admin_required
def tambah_bayarpiutang(request):
    return render(request, 'piutang/tambahpiutang.html')