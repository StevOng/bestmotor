from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import F
from ...models.barang import *
from .serializer import *

class BarangViewSet(viewsets.ModelViewSet):
    queryset = Barang.objects.all()
    serializer_class = BarangSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['kode_barang', 'nama_barang']
    parser = (MultiPartParser, FormParser) # Memproses file upload

    def create(self, request, *args, **kwargs):
        file = request.FILES.get("gambar") # Ambil file dari request
        if file:
            request.data["gambar"] = file.read() # Simpan sebagai biner
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def kategori_choices(self, request):
        choices = [{'value': value, 'label': label} for value, label in Barang.CHOICES]
        return Response(choices)
    
    @action(detail=False, methods=['get'])
    def merk_choices(self, request):
        choices = [{'value': value, 'label': label} for value, label in Barang.MERK]
        return Response(choices)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        queryset = self.get_queryset().filter(stok__lte=F('stok_minimum')).order_by('stok')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def top_sold(self, request):
        queryset = self.get_queryset().order_by('-qty_terjual')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def least_sold(self, request):
        queryset = self.get_queryset().order_by('qty_terjual')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TierHargaViewSet(viewsets.ModelViewSet):
    queryset = TierHarga.objects.all()
    serializer_class = TierHargaSerializer