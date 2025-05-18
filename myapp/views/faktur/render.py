from django.shortcuts import render
from django.db.models import Prefetch
from ...models.faktur import Faktur
from ...decorators import *

@both_required
def faktur(request):
    status = request.GET.get("status", None)
    per_tgl = request.GET.get("per_tgl")

    list_faktur = Faktur.objects.select_related('pesanan').prefetch_related(
        Prefetch('pesanan__detailpesanan_set')
    )
    
    if per_tgl:
        list_faktur = list_faktur.filter(
            pesanan__detailpesanan__jatuh_tempo=per_tgl
        ).distinct()

    if status:
        list_faktur = list_faktur.filter(status=status)
    return render(request, 'faktur/faktur.html', {'list_faktur': list_faktur})