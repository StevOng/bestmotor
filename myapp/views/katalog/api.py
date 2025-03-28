from rest_framework import viewsets
from ...models.katalog import Katalog
from .serializer import KatalogSerializer

class KatalogViewSet(viewsets.ModelViewSet):
    queryset = Katalog.objects.all()
    serializer_class = KatalogSerializer