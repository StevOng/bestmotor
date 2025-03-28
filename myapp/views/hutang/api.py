from rest_framework import viewsets
from ...models.hutang import Hutang
from .serializer import HutangSerializer

class HutangViewSet(viewsets.ModelViewSet):
    queryset = Hutang.objects.all()
    serializer_class = HutangSerializer