from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'katalog', KatalogViewSet)
router.register(r'katalogbarang', KatalogBarangViewSet)

urlpatterns = [
    path('admin/', render.admin_katalog, name='admin_katalog'),
    path('tambah/', render.tambah_brgkatalog, name='tambah_brgkatalog'),
    path('tambah/<int:id>/', render.tambah_brgkatalog, name='tambah_brgkatalog'),
    path('deskripsi/<int:katalog_id>/', render.deskripsi, name='deskripsi'),
    path('<str:tipe>/', render.katalogbrg, name='katalogbrg'),
]
