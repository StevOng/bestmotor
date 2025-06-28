from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'bonus', BonusViewSet)
router.register(r'persenbonus', BonusDetailViewSet)

urlpatterns = [
    path('', render.bonus_sales, name='bonus_sales'),
    path('merek/', render.bonus_merek, name='bonus_merek'),
]