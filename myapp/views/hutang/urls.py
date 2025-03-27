from django.urls import path
from . import render

urlpatterns = [
    path('hutang/', render.hutang, name='pembayaran_hutang'),
    path('hutang/tambah/', render.tambah_bayarhutang, name='tambah_bayarhutang'),
]
