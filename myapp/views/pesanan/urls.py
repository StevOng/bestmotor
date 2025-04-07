from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'pesanan', PesananViewSet)
router.register(r'detailpesanan', DetailPesananViewSet)

urlpatterns = [
    path('', render.pesanan, name='pesanan'),
    path('tambah/', render.tambah_pesanan, name='tambah_pesanan'),
    path('tambah/<int:id>/', render.tambah_pesanan, name='tambah_pesanan')
]
