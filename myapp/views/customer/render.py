from django.shortcuts import render
from myapp.utils.decorators import both_required
from myapp.utils.activity_logs import activity_logs
from ...models.customer import Customer

@both_required
@activity_logs
def customer(request):
    customers = Customer.objects.all()
    role = request.session.get("role")
    user_id = request.session.get("user_id")

    if role == "sales":
        customers = Customer.objects.filter(user_id=user_id)

    return render(request, 'customer/customer.html', {'customers':customers})

@both_required
@activity_logs
def tambah_customer(request, id=None):
    customer = None
    if id:
        customer = Customer.objects.select_related('user_id').get(id=id)
    return render(request, 'customer/tambahcust.html', {'customer': customer})