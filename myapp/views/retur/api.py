from rest_framework import viewsets
from ...models.retur import *
from .serializer import *

class ReturBeliViewSet(viewsets.ModelViewSet):
    queryset = ReturBeli.objects.all()
    serializer_class = ReturBeliSerializer

    def get_queryset(self):
        invoice_id = self.request.query_params.get('invId')
        if invoice_id:
            try:
                invoice = Invoice.objects.select_related("supplier_id").get(id=invoice_id)
                return Barang.objects.filter(detailinvoice__invoice_id=invoice.id).distinct()
            except Invoice.DoesNotExist:
                return Barang.objects.none()
        return super().get_queryset()


class ReturJualViewSet(viewsets.ModelViewSet):
    queryset = ReturJual.objects.all()
    serializer_class = ReturJualSerializer

    def get_queryset(self):
        faktur_id = self.request.query_params.get('fakturId')
        if faktur_id:
            try:
                faktur = Faktur.objects.select_related("pesanan_id__customer_id").get(id=faktur_id)
                return Barang.objects.filter(detailpesanan__pesanan_id=faktur.pesanan_id).distinct()
            except Faktur.DoesNotExist:
                return Barang.objects.none()
        return super().get_queryset()