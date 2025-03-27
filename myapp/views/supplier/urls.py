from django.urls import path
from . import render

urlpatterns = [
    path('', render.supplier, name='supplier'),
    path('tambah/', render.tambah_supplier, name='tambah_supplier'),
]
