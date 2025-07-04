from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
    
    @action(detail=True, methods=['post'])
    def reset_images(self, request, pk=None):
        KatalogBarang.objects.filter(katalog_id=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class KatalogBarangViewSet(viewsets.ModelViewSet):
    queryset = KatalogBarang.objects.all()
    serializer_class = KatalogBarangSerializer