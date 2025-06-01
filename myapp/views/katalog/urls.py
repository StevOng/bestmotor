from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import KatalogViewSet
from . import render

router = DefaultRouter()
router.register(r'katalog', KatalogViewSet)

urlpatterns = [
    path('admin/', render.admin_katalog, name='admin_katalog'),
    path('tambah/', render.tambah_brgkatalog, name='tambah_brgkatalog'),
    path('<str:kategori>/', render.katalogbrg, name='katalogbrg'),
    path('<str:kategori>/<int:barang_id>/deskripsi/', render.deskripsi, name='deskripsi'),
]
