from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import PiutangViewSet
from . import render

router = DefaultRouter()
router.register(r'piutang', PiutangViewSet)

urlpatterns = [
    path('piutang/', render.piutang, name='pembayaran_piutang'),
    path('piutang/tambah/', render.tambah_bayarpiutang, name='tambah_bayarpiutang'),
    path('piutang/tambah/<int:id/', render.tambah_bayarpiutang, name='tambah_bayarpiutang'),
]
