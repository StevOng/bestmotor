from django.shortcuts import render, get_object_or_404
from collections import defaultdict
from ...decorators import *
from ...models.katalog import *
from ...models.barang import *

@admin_required
def admin_katalog(request):
    data = Katalog.objects.prefetch_related("barang_set").all()
    return render(request, 'katalog/adminkatalog.html', {"data_katalog": data})

def katalog(request):
    katalog_list = Katalog.objects.prefetch_related('barang', 'katalogbarang_set__barang')

    tipe_katalog = defaultdict(list)

    for katalog in katalog_list:
        barang = katalog.barang.first()

        if not barang:
            continue

        gambar_obj = katalog.katalogbarang_set.filter(barang=barang).first()
        gambar = gambar_obj.gambar.url if gambar_obj and gambar_obj.gambar else None

        tipe = barang.tipe.lower()

        tipe_katalog[tipe].append({
            "barang": barang,
            "katalog": katalog,
            "gambar": gambar,
        })
    return render(request, "katalog/katalog.html", {'tipe_katalog': dict(tipe_katalog)})

def katalogbrg(request, tipe):
    data = []
    title = tipe

    # Ambil semua barang bertipe tertentu, termasuk relasi ke KatalogBarang
    barang_list = Barang.objects.filter(tipe=tipe).prefetch_related("katalogbarang_set", "katalog_set")

    for barang in barang_list:
        # Ambil satu entri katalog terkait barang
        katalog = barang.katalog_set.first()

        # Ambil satu gambar dari KatalogBarang (jika ada)
        katalog_barang = barang.katalogbarang_set.first()
        gambar_url = katalog_barang.gambar.url if katalog_barang and katalog_barang.gambar else None

        data.append({
            "nama": barang.nama_barang,
            "merk": barang.merk,
            "harga_diskon": katalog.harga_diskon if katalog else "-",
            "id": barang.id,
            "tipe": barang.tipe,
            "gambar": gambar_url,
        })

    return render(request, "katalog/katalogbrg.html", {
        "tipe": tipe,
        "items": data,
        "title": title
    })

@admin_required
def tambah_brgkatalog(request, id=None):
    katalog = None
    barang = None
    katalogbrg = None
    if id:
        katalog = Katalog.objects.prefetch_related("barang").get(id=id)
        katalogbrg = KatalogBarang.objects.select_related("barang").filter(katalog=katalog)
        barang = katalog.barang.first()
    return render(request, 'katalog/tambahkatalog.html', {"katalog": katalog, "barang": barang, "katalogbrg": katalogbrg})

def deskripsi(request, tipe, barang_id):
    barang = get_object_or_404(Barang, id=barang_id, tipe=tipe)
    katalog = Katalog.objects.filter(barang=barang).first()
    return render(request, "katalog/deskripsi.html", {"barang": barang, "katalog": katalog})