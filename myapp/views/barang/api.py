from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import F
from ...models.barang import *
from ...models.bonus import *
from .serializer import *
from .tipe_choices import TIPE
from .merk_choices import MERK

class BarangViewSet(viewsets.ModelViewSet):
    queryset = Barang.objects.all()
    serializer_class = BarangSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['kode_barang', 'nama_barang']
    parser = (MultiPartParser, FormParser) # Memproses file upload
    
    @action(detail=False, methods=['get'])
    def tipe_choices(self, request):
        choices = [{'value': value, 'label': label} for value, label in TIPE]
        sorted_choices = sorted(choices, key=lambda x: x['value'].lower())
        return Response(sorted_choices)
    
    @action(detail=False, methods=['get'])
    def merk_choices(self, request):
        choices = [{'value': value, 'label': label} for value, label in MERK]
        sorted_choices = sorted(choices, key=lambda x: x['value'].lower())
        return Response(sorted_choices)
    
    @action(detail=False, methods=['get'])
    def merk_choices_listmerek(self, request):
        used_merks = PersenBonus.objects.values_list("merk_nama", flat=True)

        aktif = []
        nonaktif = []

        for value, label in MERK:
            option = {
                'value': value,
                'label': label,
            }

            if value in used_merks:
                option['disabled'] = True
                nonaktif.append(option)
            else:
                aktif.append(option)

        # Urutkan masing-masing grup berdasarkan label
        aktif = sorted(aktif, key=lambda x: x['label'].lower())
        nonaktif = sorted(nonaktif, key=lambda x: x['label'].lower())

        return Response(aktif + nonaktif)
    
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

    def get_queryset(self):
        queryset = TierHarga.objects.all()
        barang_id = self.request.query_params.get('barang_id')
        if barang_id:
            queryset = queryset.filter(barang_id=barang_id)
        return queryset
    