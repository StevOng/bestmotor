from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'admin', AdminViewSet)
router.register(r'sales', SalesViewSet)

urlpatterns = [
    path('', render.dashboard, name='dashboard'),
]
