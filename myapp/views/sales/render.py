from django.shortcuts import render
from ...decorators import *
from ...models.barang import *

@admin_required
def sales(request):
    return render(request, 'sales/sales.html')

@both_required
def bonus(request):
    return render(request, 'sales/sales.html', {"list":"bonus"})

@admin_required
def bonus_merek(request):
    return render(request, 'sales/sales.html', {"list":"merek"})