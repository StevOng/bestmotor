from rest_framework import viewsets
from ...models.customer import Customer
from .serializer import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer