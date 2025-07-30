from django.shortcuts import render
from myapp.utils.decorators import admin_required
from myapp.utils.activity_logs import activity_logs
from ...models.invoice import *
from ...models.supplier import Supplier
from django.utils.timezone import now
from django.db.models import Q


@admin_required
@activity_logs
def invoice(request):
    status = request.GET.get("status", None)
    per_tgl = request.GET.get("per_tgl")
    today = now().date()
    invoice_list = Invoice.objects.prefetch_related("detailinvoice_set")

    if per_tgl:
        invoice_list = invoice_list.filter(jatuh_tempo__date=per_tgl)

    if status == "jatuh_tempo":
        invoice_list = invoice_list.filter(
            Q(status="jatuh_tempo") |
            Q(status="belum_lunas", jatuh_tempo__date__lte=today)
        ).order_by("jatuh_tempo")
    elif status == "belum_lunas":
        invoice_list = invoice_list.filter(
            status="belum_lunas", jatuh_tempo__date__gte=today
        )
    return render(request, 'invoice/invoice.html', {'invoice_list': invoice_list, 'status': status})

@admin_required
@activity_logs
def tambah_invoice(request, id=None):
    invoice = None
    detailinvoice = None
    supplier = Supplier.objects.all()
    is_lunas = None

    if id:
        invoice = Invoice.objects.get(id=id)
        is_lunas = invoice.status == "lunas"
        detailinvoice = invoice.detailinvoice_set.all()

    return render(request, 'invoice/tambahinvoice.html', {'suppliers': supplier, 'detailinvoice': detailinvoice, 'invoice': invoice, 'is_lunas': is_lunas })