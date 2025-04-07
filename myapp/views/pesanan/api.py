from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ...models.pesanan import *
from .serializer import *

class PesananViewSet(viewsets.ModelViewSet):
    queryset = Pesanan.objects.all()
    serializer_class = PesananSerializer

    @action(detail=False, methods=['patch'])
    def update_status_bulk(self, request):
        ids = request.data.get('ids', [])
        new_status = request.data.get('status', None)

        if not ids or not new_status:
            return Response({"error":"IDs dan status harus dikirim"}, status=status.HTTP_400_BAD_REQUEST)
        
        Pesanan.objects.filter(id__in=ids).update(status=new_status)
        return Response({"message":"Status pesanan berhasil diperbarui"})

class DetailPesananViewSet(viewsets.ModelViewSet):
    queryset = DetailPesanan.objects.all()
    serializer_class = DetailPesananSerializer

    @action(detail=False, methods=['get'])
    def kurir_choices(self, request):
        choices = [{'value': value, 'label': label} for value, label in DetailPesanan.CHOICES]
        return Response(choices)