from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'invoice', InvoiceViewSet)
router.register(r'detailinvoice', DetailInvoiceViewSet)

urlpatterns = [
    path('invoice/', render.invoice, name='invoice'),
    path('invoice/tambah/', render.tambah_invoice, name='tambah_invoice'),
]
