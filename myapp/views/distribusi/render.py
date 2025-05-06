from django.shortcuts import render, get_object_or_404
from ...decorators import admin_required
from ...models.distribusi import *

@admin_required
def transaksi_masuk(request):
    barang_masuk = TransaksiMasuk.objects.all().order_by('-tanggal_pembuatan')
    return render(request, 'distribusi/transaksi.html', {'jenis':'masuk', 'data_transaksi':barang_masuk})

@admin_required
def transaksi_keluar(request):
    barang_keluar = TransaksiKeluar.objects.all().order_by('-tanggal_pembuatan')
    return render(request, 'distribusi/transaksi.html', {'jenis':'keluar', 'data_transaksi':barang_keluar})

@admin_required
def tambah_transaksi(request, jenis):
    if jenis not in ['masuk','keluar']:
        return render(request, '404.html')
    
    transaksi = None
    transaksi_id = request.GET.get('id')

    if transaksi_id:
        if jenis == 'masuk':
            transaksi = get_object_or_404(TransaksiMasuk, pk=transaksi_id)
        else:
            transaksi = get_object_or_404(TransaksiKeluar, pk=transaksi_id)

    qty = getattr(transaksi, 'qty_masuk' if jenis == 'masuk' else 'qty_keluar', 0) if transaksi else 0
    
    return render(request, 'distribusi/tambahtransaksi.html', {'jenis': jenis, 'data_transaksi':transaksi, 'qty_barang': qty})