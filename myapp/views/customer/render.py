from django.shortcuts import render
from myapp.utils.decorators import both_required
from myapp.utils.activity_logs import activity_logs
from myapp.utils.control_access import customer_control_access
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
    response = customer_control_access(request, id)
    if response:
        return response
    
    customer = None
    if id:
        customer = Customer.objects.select_related('user_id').get(id=id)
    return render(request, 'customer/tambahcust.html', {'customer': customer})