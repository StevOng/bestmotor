from django.urls import path
from . import render

urlpatterns = [
    path('', render.customer, name='customer'),
    path('tambah/', render.tambah_customer, name='tambah_customer'),
]
