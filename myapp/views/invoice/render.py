from django.shortcuts import render
from decorators import admin_required

@admin_required
def invoice(request):
    return render(request, 'invoice.html')

@admin_required
def tambah_invoice(request):
    return render(request, 'tambahinvoice.html')