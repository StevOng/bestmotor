from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import SupplierViewSet
from . import render

router = DefaultRouter()
router.register(r'supplier', SupplierViewSet)

urlpatterns = [
    path('', render.supplier, name='supplier'),
    path('tambah/', render.tambah_supplier, name='tambah_supplier'),
]
