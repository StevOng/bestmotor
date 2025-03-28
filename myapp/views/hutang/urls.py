from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import HutangViewSet
from . import render

router = DefaultRouter()
router.register(r'hutang', HutangViewSet)

urlpatterns = [
    path('hutang/', render.hutang, name='pembayaran_hutang'),
    path('hutang/tambah/', render.tambah_bayarhutang, name='tambah_bayarhutang'),
]
