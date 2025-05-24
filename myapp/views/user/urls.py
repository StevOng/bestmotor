from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'user', UserViewSet)

urlpatterns = [
    path('', render.dashboard, name='dashboard'),
]
