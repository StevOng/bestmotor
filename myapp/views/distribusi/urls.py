from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'transaksimasuk', TransaksiMasukViewSet)
router.register(r'transaksikeluar', TransaksiKeluarViewSet)

urlpatterns = [
    path('masuk/', render.transaksi_masuk, name='transaksi_masuk'),
    path('keluar/', render.transaksi_keluar, name='transaksi_keluar'),
    path('<str:jenis>/tambah/', render.tambah_transaksi, name='tambah_transaksi'),
]
