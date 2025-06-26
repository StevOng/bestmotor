from django.shortcuts import render
from ...decorators import *
from ...models.barang import *

@both_required
def bonus_sales(request):
    return render(request, 'bonus/bonus.html')

@admin_required
def bonus_merek(request):
    return render(request, 'bonus/bonus.html', {"list":"merek"})