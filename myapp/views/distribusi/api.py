from rest_framework import viewsets, status
from rest_framework.response import Response
from ...models.distribusi import *
from .serializer import *

class TransaksiMasukViewSet(viewsets.ModelViewSet):
    queryset = TransaksiMasuk.objects.all()
    serializer_class = TransaksiMasukSerializer

class TransaksiKeluarViewSet(viewsets.ModelViewSet):
    queryset = TransaksiKeluar.objects.all()
    serializer_class = TransaksiKeluarSerializer

class TransaksiMasukBarangViewSet(viewsets.ModelViewSet):
    queryset = TransaksiMasukBarang.objects.all()
    serializer_class = TransaksiMasukBarangSerializer

class TransaksiKeluarBarangViewSet(viewsets.ModelViewSet):
    queryset = TransaksiKeluarBarang.objects.all()
    serializer_class = TransaksiKeluarBarangSerializer