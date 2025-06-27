from django.urls import path
from rest_framework.routers import DefaultRouter
from . import render

router = DefaultRouter()

urlpatterns = [
    path('', render.sales, name='sales'),
    path('bonus/', render.bonus, name='bonus'),
    path('merek/', render.bonus_merek, name='bonus_merek'),
]