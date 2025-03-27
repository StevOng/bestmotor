from django.urls import path
from . import render

urlpatterns = [
    path('piutang/', render.piutang, name='pembayaran_piutang'),
    path('piutang/tambah/', render.tambah_bayarpiutang, name='tambah_bayarpiutang'),
]
