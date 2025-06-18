from django.shortcuts import render, get_object_or_404
from collections import defaultdict
import base64
from ...decorators import *
from ...models.katalog import Katalog
from ...models.barang import *

@admin_required
def admin_katalog(request):
    data = Katalog.objects.prefetch_related("barang_set").all()
    return render(request, 'katalog/adminkatalog.html', {"data_katalog": data})

def katalog(request):
    data_katalog = Katalog.objects.prefetch_related("barang_set__tierharga_set").all()

    tipe_katalog = defaultdict(list)
    for katalog in data_katalog:
        for barang in katalog.barang_set.all():
            gambar_base64 = None
            detail = barang.detailbarang_set.first()
            if detail and detail.gambar:
                gambar_base64 = base64.b64encode(detail.gambar).decode('utf-8')
                gambar_base64 = f"data:image/jpeg;base64,{gambar_base64}"
            tipe_katalog[barang.tipe].append({
                'katalog': katalog,
                'barang': barang,
                "gambar": gambar_base64
            })
    return render(request, "katalog/katalog.html", {'tipe_katalog': list(dict.fromkeys(tipe_katalog))})

def katalogbrg(request, tipe):
    data = []
    title = tipe
    barang_list = Barang.objects.filter(tipe=tipe).prefetch_related("katalog_set")
    for barang in barang_list:
        detail = barang.first()
        katalog = barang.katalog_set.first()

        gambar = None
        if detail and detail.gambar:
            import base64
            gambar = base64.b64encode(detail.gambar).decode("utf-8")
            gambar = f"data:image/jpeg;base64,{gambar}"

        data.append({
            "nama": barang.nama_barang,
            "merk": barang.merk,
            "gambar": gambar,
            "harga_diskon": katalog.harga_diskon if katalog else "-",
            "id": barang.id,
            "tipe": barang.tipe,
        })
    return render(request, "katalog/katalogbrg.html", {"tipe": tipe, "items": data, "title": title})

@admin_required
def tambah_brgkatalog(request, id=None):
    barang = None
    katalog = None
    if id:
        barang = Barang.objects.get(id=id)
        katalog = barang.katalog_set.first() if barang else None
    return render(request, 'katalog/tambahkatalog.html', {"katalog": katalog})

def deskripsi(request, tipe, barang_id):
    barang = get_object_or_404(Barang, id=barang_id, tipe=tipe)
    detail = barang.first()
    katalog = Katalog.objects.filter(barang=barang).first()

    deskripsi = detail.keterangan if detail and detail.keterangan else "Deskripsi belum tersedia"
    harga_tertera = katalog.harga_tertera
    harga_diskon = katalog.harga_diskon
    return render(request, "katalog/deskripsi.html", {"barang": barang, "detail": detail, "deskripsi": deskripsi, "harga_tertera": harga_tertera, "harga_diskon": harga_diskon})