from rest_framework import viewsets
from ...models.piutang import *
from .serializer import *

class PiutangViewSet(viewsets.ModelViewSet):
    queryset = Piutang.objects.all().select_related("customer_id__user_id")
    serializer_class = PiutangSerializer

class PiutangFakturViewSet(viewsets.ModelViewSet):
    queryset = PiutangFaktur.objects.all()
    serializer_class = PiutangFakturSerializer