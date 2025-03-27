from django.urls import path
from . import render

urlpatterns = [
    path('faktur/', render.faktur, name='faktur'),
]
