from django.urls import path
from rest_framework.routers import DefaultRouter
from . import render

router = DefaultRouter()

urlpatterns = [
    path('', render.bonus_sales, name='bonus_sales'),
    path('merek/', render.bonus_merek, name='bonus_merek'),
]