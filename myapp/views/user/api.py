from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from ...models.user import User
from .serializer import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'])
    def list_sales(self, request):
        users = User.objects.filter(role__in=['admin', 'sales'])
        choices = [{'value': user.id, 'label': user.nama} for user in users]
        return Response(choices)