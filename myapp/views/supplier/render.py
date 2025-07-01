from django.shortcuts import render
from myapp.utils.decorators import admin_required
from myapp.utils.activity_logs import activity_logs
from ...models.supplier import Supplier

@admin_required
@activity_logs
def supplier(request):
    supplier = Supplier.objects.all()
    return render(request, 'supplier/supplier.html', {'supplier': supplier})

@admin_required
@activity_logs
def tambah_supplier(request, id=None):
    supplier = None
    if id:
        supplier = Supplier.objects.get(id=id)
    return render(request, 'supplier/tambahsupplier.html', {'supplier': supplier})