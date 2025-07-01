from django.shortcuts import render, get_object_or_404
from myapp.utils.decorators import admin_required
from myapp.utils.activity_logs import activity_logs
from ...models.distribusi import *

@admin_required
@activity_logs
def transaksi_masuk(request):
    barang_masuk = TransaksiMasuk.objects.all().order_by('-tanggal_pembuatan')
    return render(request, 'distribusi/transaksi.html', {'jenis':'masuk', 'data_transaksi':barang_masuk})

@admin_required
@activity_logs
def transaksi_keluar(request):
    barang_keluar = TransaksiKeluar.objects.all().order_by('-tanggal_pembuatan')
    return render(request, 'distribusi/transaksi.html', {'jenis':'keluar', 'data_transaksi':barang_keluar})

@admin_required
@activity_logs
def tambah_transaksi(request, jenis):
    if jenis not in ['masuk','keluar']:
        return render(request, '404.html')
    
    transaksi = None
    transaksi_id = request.GET.get('id')
    data_transaksi = []

    if transaksi_id:
        if jenis == 'masuk':
            transaksi = get_object_or_404(TransaksiMasuk, pk=transaksi_id)
            data_transaksi = TransaksiMasukBarang.objects.filter(transaksi=transaksi).select_related("barang")
        else:
            transaksi = get_object_or_404(TransaksiKeluar, pk=transaksi_id)
            data_transaksi = TransaksiKeluarBarang.objects.filter(transaksi=transaksi).select_related("barang")
    
    return render(request, 'distribusi/tambahtransaksi.html', {'jenis': jenis, 'transaksi': transaksi, 'data_transaksi':data_transaksi})