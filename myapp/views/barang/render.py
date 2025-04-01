from django.shortcuts import render
from django.utils.dateparse import parse_date
from django.db.models import Sum, Q
from ...decorators import *
from ...models.barang import *

@both_required
def barang(request):
    filter = request.GET.get('filter')
    dari = request.GET.get('dari_tgl')
    sampe = request.GET.get('smpe_tgl')
    detailBrg = DetailBarang.objects.all()

    for brg in detailBrg:
        brg.total_pesanan = sum(d.qty_pesan for d in brg.barang.detailpesanan_set.all())

    if filter == "laku":
        detailBrg = get_barang_laku(dari, sampe)
    elif filter == "rendah":
        detailBrg = DetailBarang.objects.filter(stok__lt=models.F('stok_minimum'))

    return render(request, 'barang.html', {'barang': detailBrg,'filter': filter})

@admin_required
def tambah_barang(request, id=None):
    if id:
        barang = Barang.objects.get(id=id)
        detail_barang = barang.detailbarang__set.first()
    else:
        None
    return render(request, 'tambahbrg.html', {'detail_barang': detail_barang})

def get_barang_laku(dari, sampe):
    dari = parse_date(dari)
    sampe = parse_date(sampe)

    return Barang.objects.annotate(total_terjual=Sum(
        'detailpesanan_qty_pesan',
        filter=Q(detailpesanan__tanggal_pesanan__range=[dari,sampe])
    )).filter(total_terjual__gt=0)