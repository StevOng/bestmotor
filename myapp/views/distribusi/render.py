from django.shortcuts import render
from decorators import admin_required

@admin_required
def transaksi_masuk(request):
    return render(request, 'transaksi.html')

@admin_required
def transaksi_keluar(request):
    return render(request, 'transaksi.html')

@admin_required
def tambah_masuk(request):
    return render(request, 'tambahtransaksi.html')

@admin_required
def tambah_keluar(request):
    return render(request, 'tambahtransaksi.html')