from rest_framework import viewsets
from ...models.faktur import Faktur
from .serializer import FakturSerializer

class FakturViewSet(viewsets.ModelViewSet):
    queryset = Faktur.objects.all()
    serializer_class = FakturSerializer