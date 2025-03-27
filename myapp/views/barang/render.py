from django.shortcuts import render
from decorators import *

@both_required
def barang(request):
    return render(request, 'barang.html')

@admin_required
def tambah_barang(request):
    return render(request, 'tambahbrg.html')