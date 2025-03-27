from django.urls import path
from . import render

urlpatterns = [
    path('invoice/', render.invoice, name='invoice'),
    path('invoice/tambah/', render.tambah_invoice, name='tambah_invoice'),
]
