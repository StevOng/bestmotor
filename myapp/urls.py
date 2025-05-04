from django.urls import path, re_path, include
from .views.katalog.render import katalog
from .views.user.render import login
from . import render

urlpatterns = [
    path('', katalog, name='katalog'),
    path('login/', login , name='login'),
    path('barang/', include('myapp.views.barang.urls')),
    path('barang/transaksi/', include('myapp.views.distribusi.urls')),
    path('customer/', include('myapp.views.customer.urls')),
    path('penjualan/', include('myapp.views.faktur.urls')),
    path('penjualan/pembayaran/', include('myapp.views.piutang.urls')),
    path('pembelian/', include('myapp.views.invoice.urls')),
    path('pembelian/pembayaran/', include('myapp.views.hutang.urls')),
    path('pesanan/', include('myapp.views.pesanan.urls')),
    path('katalog/', include('myapp.views.katalog.urls')),
    path('retur/', include('myapp.views.retur.urls')),
    path('supplier/', include('myapp.views.supplier.urls')),
    path('dashboard/', include('myapp.views.user.urls')),
    path('bantuan/', render.bantuan, name='bantuan'),
    path('not-allowed/', render.halaman403, name='403'),
    re_path(r'^.*$', render.halaman404, name='404'),
]
