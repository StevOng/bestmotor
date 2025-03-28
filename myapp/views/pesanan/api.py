from rest_framework import viewsets
from ...models.pesanan import *
from .serializer import *

class PesananViewSet(viewsets.ModelViewSet):
    queryset = Pesanan.objects.all()
    serializer_class = PesananSerializer

class DetailPesananViewSet(viewsets.ModelViewSet):
    queryset = DetailPesanan.objects.all()
    serializer_class = DetailPesananSerializer