from django.shortcuts import render
from ...decorators import admin_required
from ...models.invoice import *
from ...models.supplier import Supplier

@admin_required
def invoice(request):
    status = request.GET.get("status", None)
    per_tgl = request.GET.get("per_tgl")
    invoice_list = Invoice.objects.prefetch_related("detailinvoice_set")

    if per_tgl:
        invoice_list = invoice_list.filter(
            detailinvoice__jatuh_tempo = per_tgl
        ).distinct()

    if status:
        invoice_list = invoice_list.filter(status=status)
    return render(request, 'invoice/invoice.html', {'invoice_list': invoice_list})

@admin_required
def tambah_invoice(request, id=None):
    invoice = None
    detailinvoice = None
    supplier = Supplier.objects.all()

    if id:
        invoice = Invoice.objects.get(id=id)
        detailinvoice = invoice.detailinvoice_set.first()

    return render(request, 'invoice/tambahinvoice.html', {'suppliers': supplier, 'detailinvoice': detailinvoice })