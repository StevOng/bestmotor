from rest_framework import viewsets
from ...models.hutang import *
from .serializer import *

class HutangViewSet(viewsets.ModelViewSet):
    queryset = Hutang.objects.all().select_related("supplier_id")
    serializer_class = HutangSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # rollback setiap faktur
        for ht in instance.hutanginvoice_set.all():
            invoice = ht.invoice
            invoice.sisa_bayar = invoice.sisa_bayar + ht.nilai_bayar
            invoice.status     = 'jatuh_tempo'
            invoice.save(update_fields=['sisa_bayar','status'])
        # baru hapus Piutang & PiutangFaktur cascade
        return super().destroy(request, *args, **kwargs)

class HutangInvoiceViewSet(viewsets.ModelViewSet):
    queryset = HutangInvoice.objects.all()
    serializer_class = HutangInvoiceSerializer