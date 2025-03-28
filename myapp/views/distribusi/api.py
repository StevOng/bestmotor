from rest_framework import viewsets
from ...models.distribusi import *
from .serializer import *

class TransaksiMasukViewSet(viewsets.ModelViewSet):
    queryset = TransaksiMasuk.objects.all()
    serializer_class = TransaksiMasukSerializer

class TransaksiKeluarViewSet(viewsets.ModelViewSet):
    queryset = TransaksiKeluar.objects.all()
    serializer_class = TransaksiKeluarSerializer