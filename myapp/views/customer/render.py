from django.shortcuts import render
from ...decorators import both_required

@both_required
def customer(request):
    return render(request, 'customer/customer.html')

@both_required
def tambah_customer(request):
    return render(request, 'customer/tambahcust.html')