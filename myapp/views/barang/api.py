from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import action
from ...models.barang import *
from .serializer import *

class BarangViewSet(viewsets.ModelViewSet):
    queryset = Barang.objects.all()
    serializer_class = BarangSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['kode_barang', 'nama_barang']

class DetailBarangViewSet(viewsets.ModelViewSet):
    queryset = DetailBarang.objects.all()
    serializer_class = DetailBarangSerializer
    parser = (MultiPartParser, FormParser) # Memproses file upload

    def create(self, request, *args, **kwargs):
        file = request.FILES.get("gambar") # Ambil file dari request
        if file:
            request.data["gambar"] = file.read() # Simpan sebagai biner
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def kategori_choices(self, request):
        choices = [{'value': value, 'label': label} for value, label in DetailBarang.CHOICES]
        return Response(choices)
    
    @action(detail=False, methods=['get'])
    def merk_choices(self, request):
        choices = [{'value': value, 'label': label} for value, label in DetailBarang.MERK]
        return Response(choices)