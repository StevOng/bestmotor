from django.urls import path
from . import render

urlpatterns = [
    path('', render.barang, name='barang'),
    path('tambah/', render.tambah_barang, name='tambah_barang'),
]
