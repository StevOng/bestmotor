from rest_framework import viewsets
from ...models.invoice import *
from .serializer import *

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class DetailInvoiceViewSet(viewsets.ModelViewSet):
    queryset = DetailInvoice.objects.all()
    serializer_class = DetailInvoiceSerializer