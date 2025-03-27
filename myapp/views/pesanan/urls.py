from django.urls import path
from . import render

urlpatterns = [
    path('', render.pesanan, name='pesanan'),
    path('tambah/', render.tambah_pesanan, name='tambah_pesanan'),
]
