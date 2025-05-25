from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import CustomerViewSet
from . import render

router = DefaultRouter()
router.register(r'customer', CustomerViewSet)

urlpatterns = [
    path('', render.customer, name='customer'),
    path('tambah/', render.tambah_customer, name='tambah_customer'),
    path('tambah/<int:id>/', render.tambah_customer, name='tambah_customer')
]
