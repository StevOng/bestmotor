from rest_framework import viewsets
from ...models.retur import *
from .serializer import *

class ReturBeliViewSet(viewsets.ModelViewSet):
    queryset = ReturBeli.objects.all()
    serializer_class = ReturBeliSerializer

class ReturJualViewSet(viewsets.ModelViewSet):
    queryset = ReturJual.objects.all()
    serializer_class = ReturJualSerializer