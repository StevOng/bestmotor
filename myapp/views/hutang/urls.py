from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'hutang', HutangViewSet)
router.register(r'hutanginvoice', HutangInvoiceViewSet)

urlpatterns = [
    path('hutang/', render.hutang, name='pembayaran_hutang'),
    path('hutang/tambah/', render.tambah_bayarhutang, name='tambah_bayarhutang'),
    path('hutang/tambah/<int:id>/', render.tambah_bayarhutang, name='tambah_bayarhutang')
]
