from django.shortcuts import render
from decorators import admin_required

@admin_required
def supplier(request):
    return render(request, 'supplier.html')

@admin_required
def tambah_supplier(request):
    return render(request, 'tambahsupplier.html')