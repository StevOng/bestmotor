from django.shortcuts import render, get_object_or_404
from django.core.serializers.json import DjangoJSONEncoder
from collections import defaultdict
from decimal import Decimal
from myapp.utils.decorators import admin_required
from myapp.utils.activity_logs import activity_logs
from ...models.katalog import *
from ...models.barang import *
import json

@admin_required
@activity_logs
def admin_katalog(request):
    data = Katalog.objects.prefetch_related("promosi_barang__barang")
    return render(request, 'katalog/adminkatalog.html', {"data_katalog": data})

def get_value_tipe(input):
    for value, label in TIPE:
        if input == value or input == label:
            return value
    return input

def get_label_tipe(input):
    for value, label in TIPE:
        if input == value or input == label:
            return label
    return input

@activity_logs
def katalog(request):
    katalog_list = Katalog.objects.prefetch_related("promosi_barang__barang").filter(is_katalog_utama=True)

    tipe_katalog = defaultdict(list)

    for katalog in katalog_list:
        barang = katalog.barang.first()

        if not barang:
            continue

        gambar_obj = katalog.promosi_barang.filter(barang=barang).first()
        gambar = gambar_obj.gambar_pelengkap.url if gambar_obj and gambar_obj.gambar_pelengkap else None

        tipe = barang.tipe
        tipe_val = get_value_tipe(tipe)
        title = get_label_tipe(tipe)

        tipe_katalog[tipe_val].append({
            "barang": barang,
            "katalog": katalog,
            "gambar": gambar,
            "tipe": tipe_val,
            "title": title
        })
    return render(request, "katalog/katalog.html", {'tipe_katalog': dict(tipe_katalog)})

@activity_logs
def katalogbrg(request, tipe):
    data = []
    title = tipe
    tipe_label = get_label_tipe(tipe)

    # Ambil semua barang bertipe tertentu, termasuk relasi ke KatalogBarang
    barang_list = Barang.objects.filter(tipe=tipe_label).prefetch_related("katalogbarang_set", "katalog_set")

    for barang in barang_list:
        # Ambil satu entri katalog terkait barang
        katalog = barang.katalog_set.first()

        # Ambil satu gambar dari KatalogBarang (jika ada)
        katalog_barang = barang.katalogbarang_set.first()
        gambar_url = katalog_barang.gambar_pelengkap.url if katalog_barang and katalog_barang.gambar_pelengkap else None
        tipe = tipe_label

        data.append({
            "nama": barang.nama_barang,
            "merk": barang.merk,
            "harga_diskon": float(katalog.harga_diskon) if katalog else 0.0,
            "katalog_id": katalog.id if katalog else None,
            "tipe": tipe,
            "gambar": gambar_url,
        })
    all_items = json.dumps(data, cls=DjangoJSONEncoder)
    return render(request, "katalog/katalogbrg.html", {
        "tipe": tipe,
        "items": data,
        "title": title,
        "all_items": all_items
    })

@admin_required
@activity_logs
def tambah_brgkatalog(request, id=None):
    katalog = None
    barang = None
    katalogbrg = None
    if id:
        katalog = Katalog.objects.prefetch_related("promosi_barang__barang").get(id=id)
        katalogbrg = KatalogBarang.objects.select_related("barang").filter(katalog=id)
        barang = katalog.barang.first()
    return render(request, 'katalog/tambahkatalog.html', {"katalog": katalog, "barang": barang, "katalogbrg": katalogbrg})

@activity_logs
def deskripsi(request, katalog_id):
    katalog = get_object_or_404(Katalog, id=katalog_id)
    katalogbrg = KatalogBarang.objects.filter(katalog=katalog).select_related("barang","katalog")
    url_list = []
    for kat in katalogbrg:
        url_list.append({"url": kat.gambar_pelengkap.url})
    return render(request, "katalog/deskripsi.html", {"katalogbrg": katalogbrg, "url_list": url_list})


def base_katalog(request):
    # Ambil semua katalog utama dengan prefetch barang
    katalog_list = Katalog.objects.prefetch_related("barang")

    tipe_katalog = defaultdict(list)

    for katalog in katalog_list:
        # Ambil satu barang dari M2M field
        barang = katalog.barang.first()
        if not barang:
            continue

        tipe = get_value_tipe(barang.tipe)
        title = get_label_tipe(barang.tipe)
        tipe_katalog[tipe].append({
            "title": title
        })

    return render(request, "katalog/home.html", {
        "tipe_katalog": dict(tipe_katalog),
    })