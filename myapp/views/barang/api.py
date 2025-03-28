from rest_framework import viewsets
from ...models.barang import *
from .serializer import *

class BarangViewSet(viewsets.ModelViewSet):
    queryset = Barang.objects.all()
    serializer_class = BarangSerializer

class DetailBarangViewSet(viewsets.ModelViewSet):
    queryset = DetailBarang.objects.all()
    serializer_class = DetailBarangSerializer