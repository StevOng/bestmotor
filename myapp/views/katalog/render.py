from django.shortcuts import render, get_object_or_404
from collections import defaultdict
import base64
from ...decorators import *
from ...models.katalog import Katalog
from ...models.barang import *

@admin_required
def admin_katalog(request):
    data = Katalog.objects.prefetch_related("barang_set").all()
    return render(request, 'adminkatalog.html', {"data_katalog": data})

def katalog(request):
    data_katalog = Katalog.objects.prefetch_related("barang_set__detailbarang_set").all()

    kategori_katalog = defaultdict(list)
    for katalog in data_katalog:
        for barang in katalog.barang_set.all():
            gambar_base64 = None
            detail = barang.detailbarang_set.first()
            if detail and detail.gambar:
                gambar_base64 = base64.b64encode(detail.gambar).decode('utf-8')
                gambar_base64 = f"data:image/jpeg;base64,{gambar_base64}"
            kategori_katalog[barang.kategori].append({
                'katalog': katalog,
                'barang': barang,
                "gambar": gambar_base64
            })
    return render(request, "katalog.html", {'kategori_katalog': dict(kategori_katalog)})

def katalogbrg(request, kategori):
    data = []
    title = kategori
    barang_list = Barang.objects.filter(kategori=kategori).prefetch_related("detailbarang_set", "katalog_set")
    for barang in barang_list:
        detail = barang.detailbarang_set.first()
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
            "kategori": barang.kategori,
        })
    return render(request, "katalogbrg.html", {"kategori": kategori, "items": data, "title": title})

@admin_required
def tambah_brgkatalog(request, id=None):
    barang = None
    katalog = None
    if id:
        barang = Barang.objects.get(id=id)
        katalog = barang.katalog_set.first() if barang else None
    return render(request, 'tambahkatalog.html', {"katalog": katalog})

def deskripsi(request, kategori, barang_id):
    barang = get_object_or_404(Barang, id=barang_id, kategori=kategori)
    detail = barang.detailbarang_set.first()
    katalog = Katalog.objects.filter(barang=barang).first()

    deskripsi = detail.keterangan if detail and detail.keterangan else "Deskripsi belum tersedia"
    harga_tertera = katalog.harga_tertera
    harga_diskon = katalog.harga_diskon
    return render(request, "deskripsi.html", {"barang": barang, "detail": detail, "deskripsi": deskripsi, "harga_tertera": harga_tertera, "harga_diskon": harga_diskon})