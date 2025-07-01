from rest_framework import viewsets
from ...models.hutang import *
from .serializer import *

class HutangViewSet(viewsets.ModelViewSet):
    queryset = Hutang.objects.all().select_related("supplier_id")
    serializer_class = HutangSerializer

class HutangInvoiceViewSet(viewsets.ModelViewSet):
    queryset = HutangInvoice.objects.all()
    serializer_class = HutangInvoiceSerializer