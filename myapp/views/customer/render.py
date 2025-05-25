from django.shortcuts import render
from ...decorators import both_required
from ...models.customer import Customer

@both_required
def customer(request):
    customers = Customer.objects.select_related('user_id').all()
    return render(request, 'customer/customer.html', {'customers':customers})

@both_required
def tambah_customer(request, id=None):
    customer = None
    if id:
        customer = Customer.objects.select_related('user_id').get(id=id)
    return render(request, 'customer/tambahcust.html', {'customer': customer})