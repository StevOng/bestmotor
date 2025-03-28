from rest_framework import viewsets
from ...models.piutang import Piutang
from .serializer import PiutangSerializer

class PiutangViewSet(viewsets.ModelViewSet):
    queryset = Piutang.objects.all()
    serializer_class = PiutangSerializer