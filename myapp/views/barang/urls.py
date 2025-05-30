from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'barang', BarangViewSet)
router.register(r'tierharga', TierHargaViewSet)

urlpatterns = [
    path('', render.barang, name='barang'),
    path('tambah/', render.tambah_barang, name='tambah_barang'),
    path('tambah/<int:id>/', render.tambah_barang, name='tambah_barang'),
    path('export_xlsx/', render.export_excel, name='export_xlsx')
]
