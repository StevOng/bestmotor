from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'returjual', ReturJualViewSet)
router.register(r'returbeli', ReturBeliViewSet)

urlpatterns = [
    path('penjualan/', render.retur_jual, name='retur_jual'),
    path('penjualan/tambah/', render.tambah_returjual, name='tambah_returjual'),
    path('pembelian/', render.retur_beli, name='retur_beli'),
    path('pembelian/tambah/', render.tambah_returbeli, name='tambah_returbeli'),
]
