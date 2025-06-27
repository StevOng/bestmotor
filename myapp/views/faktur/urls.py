from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import FakturViewSet
from . import render

router = DefaultRouter()
router.register(r'faktur', FakturViewSet)

urlpatterns = [
    path('faktur/', render.faktur, name='faktur'),
    path('faktur/export/<int:id>/', render.export_faktur, name='export_faktur'),
    path('faktur/export/filter', render.export_faktur_filter, name='export_faktur_filter'),
]
