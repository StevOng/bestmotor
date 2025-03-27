from django.urls import path
from . import render

urlpatterns = [
    path('', render.dashboard, name='dashboard'),
]
