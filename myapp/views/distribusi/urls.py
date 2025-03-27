from django.urls import path
from . import render

urlpatterns = [
    path('masuk/', render.transaksi_masuk, name='transaksi_masuk'),
    path('keluar/', render.transaksi_keluar, name='transaksi_keluar'),
    path('masuk/tambah/', render.tambah_masuk, name='tambah_masuk'),
    path('keluar/tambah/', render.tambah_keluar, name='tambah_keluar'),
]
