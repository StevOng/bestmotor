from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import *
from . import render

router = DefaultRouter()
router.register(r'bonus', BonusViewSet)
router.register(r'bonusdetail', BonusDetailViewSet)
router.register(r'persenbonus', PersenBonusViewSet)

urlpatterns = [
    path('', render.sales, name='sales'),
    path('bonus/', render.bonus, name='bonus'),
    path('merek/', render.bonus_merek, name='bonus_merek'),
]