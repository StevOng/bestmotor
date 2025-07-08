from rest_framework import viewsets, status
from rest_framework.response import Response
from ...models.distribusi import *
from .serializer import *

class TransaksiMasukViewSet(viewsets.ModelViewSet):
    queryset = TransaksiMasuk.objects.all()
    serializer_class = TransaksiMasukSerializer
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            with transaction.atomic():
                detail_items = TransaksiMasukBarang.objects.select_related("barang").filter(transaksi=instance)
                for item in detail_items:
                    barang = item.barang
                    barang.stok -= item.qty
                    barang.save(update_fields=['stok'])

                detail_items.delete()
                instance.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TransaksiKeluarViewSet(viewsets.ModelViewSet):
    queryset = TransaksiKeluar.objects.all()
    serializer_class = TransaksiKeluarSerializer
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            with transaction.atomic():
                detail_items = TransaksiKeluarBarang.objects.filter(transaksi=instance)

                for item in detail_items:
                    barang = item.barang
                    barang.stok += item.qty
                    barang.save(update_fields=['stok'])

                detail_items.delete()

                instance.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TransaksiMasukBarangViewSet(viewsets.ModelViewSet):
    queryset = TransaksiMasukBarang.objects.all()
    serializer_class = TransaksiMasukBarangSerializer

class TransaksiKeluarBarangViewSet(viewsets.ModelViewSet):
    queryset = TransaksiKeluarBarang.objects.all()
    serializer_class = TransaksiKeluarBarangSerializer