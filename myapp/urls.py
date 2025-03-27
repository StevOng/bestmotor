from django.urls import path, re_path, include
from views.katalog.render import katalog
from views.user.render import login
from . import render

urlpatterns = [
    path('', katalog, name='katalog'),
    path('login/', login , name='login'),
    path('barang/', include('views.barang.urls')),
    path('barang/transaksi/', include('views.distribusi.urls')),
    path('customer/', include('views.customer.urls')),
    path('penjualan/', include('views.faktur.urls')),
    path('penjualan/pembayaran/', include('views.piutang.urls')),
    path('pembelian/', include('views.invoice.urls')),
    path('pembelian/pembayaran/', include('views.hutang.urls')),
    path('pesanan/', include('views.pesanan.urls')),
    path('katalog/', include('views.katalog.urls')),
    path('retur/', include('views.retur.urls')),
    path('supplier/', include('views.supplier.urls')),
    path('dashboard/', include('views.user.urls')),
    path('bantuan/', render.bantuan, name='bantuan'),
    path('not-allowed/', render.halaman403, name='403'),
    re_path(r'^.*$', render.halaman404, name='404'),
]
