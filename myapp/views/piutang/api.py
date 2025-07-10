from rest_framework import viewsets
from ...models.piutang import *
from .serializer import *

class PiutangViewSet(viewsets.ModelViewSet):
    queryset = Piutang.objects.all().select_related("customer_id__user_id")
    serializer_class = PiutangSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # rollback setiap faktur
        for pf in instance.piutangfaktur_set.all():
            faktur = pf.faktur
            faktur.sisa_bayar = faktur.sisa_bayar + pf.nilai_bayar
            faktur.status     = 'jatuh_tempo'
            faktur.save(update_fields=['sisa_bayar','status'])
        # baru hapus Piutang & PiutangFaktur cascade
        return super().destroy(request, *args, **kwargs)

class PiutangFakturViewSet(viewsets.ModelViewSet):
    queryset = PiutangFaktur.objects.all()
    serializer_class = PiutangFakturSerializer