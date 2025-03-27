from django.urls import path
from . import render

urlpatterns = [
    path('rem/', render.katalogbrg, name='katalogbrg'),
    path('rem/deskripsi/', render.deskripsi, name='deskripsi'),
    path('admin/', render.admin_katalog, name='admin_katalog'),
    path('tambah/', render.tambah_brgkatalog, name='tambah_brgkatalog'),
]
