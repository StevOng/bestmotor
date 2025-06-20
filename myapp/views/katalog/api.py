from rest_framework import viewsets
from django.db.models import Q
from ...models.katalog import *
from .serializer import *

class KatalogViewSet(viewsets.ModelViewSet):
    queryset = Katalog.objects.all()
    serializer_class = KatalogSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(barang__nama__icontains=search)
            ).distinct()
        return queryset
    
class KatalogBarangViewSet(viewsets.ModelViewSet):
    queryset = KatalogBarang
    serializer_class = KatalogBarangSerializer