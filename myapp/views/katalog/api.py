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
    
class KatalogBarangViewSet(viewsets.ModelViewSet):
    queryset = KatalogBarang.objects.all()
    serializer_class = KatalogBarangSerializer
    
    @action(detail=False, methods=['get'], url_path='cek_barang')
    def cek_barang(self, request):
        barang_id = request.query_params.get("barang_id")
        exists = KatalogBarang.objects.filter(barang_id=barang_id).exists()
        return Response({"sudah_ada": exists})