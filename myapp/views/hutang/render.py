from django.shortcuts import render, get_object_or_404
from django.db.models import Sum, DecimalField, Value, Case, When, IntegerField
from django.db.models.functions import Coalesce
from django.utils.timezone import now
from datetime import timedelta
from myapp.utils.decorators import admin_required
from myapp.utils.activity_logs import activity_logs
from ...models.hutang import *
from ...models.invoice import *

@admin_required
@activity_logs
def hutang(request):
    hutang = Hutang.objects.select_related('supplier_id')
    aksi = request.GET.get("aksi", None)

    for hut in hutang:
        hut.total_invoice = hut.invoice.aggregate(total=Sum('netto'))['total'] or 0

    invoices_due_soon = Invoice.objects.none()
    if aksi == "analisis":
        today = now().date()
        in_seven = today + timedelta(days=7)
        invoices_due_soon = Invoice.objects.filter(
            status__in=["belum_lunas","jatuh_tempo"],
            jatuh_tempo__date__lte=in_seven
        ).annotate(
            overdue_flag=Case(
                When(jatuh_tempo__date__lt=today, then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )
        ).select_related("supplier_id").order_by("-overdue_flag","jatuh_tempo") # overdue(1) = urut yang paling lama dulu
    total_count = invoices_due_soon.count()
    total_sum = invoices_due_soon.aggregate(
        total=Coalesce(Sum("netto"), Value(0, output_field=DecimalField()))
    )["total"]
    return render(request, 'hutang/hutang.html', {'hutang': hutang, 'invoice_due_soon': invoices_due_soon, 'total_count': total_count, 'total_sum': total_sum})

@admin_required
@activity_logs
def tambah_bayarhutang(request, id=None):
    hutang = None
    supplier_list = Supplier.objects.all()
    invoices = Invoice.objects.filter(
        status__in=['belum_lunas', 'jatuh_tempo']
    ).prefetch_related('detailinvoice_set').select_related('supplier_id')

    data_hi = []
    if id:
        hutang = get_object_or_404(Hutang, id=id)
        data_hi = HutangInvoice.objects.filter(hutang=hutang)\
                   .select_related('invoice')

        total_inv = data_hi.aggregate(
            total=Sum('invoice__netto')
        )['total'] or 0

        hutang.total_invoice = total_inv
    return render(request, 'hutang/tambahhutang.html', {
        'hutang': hutang,
        'data_hi': data_hi,
        'invoices': invoices,
        'supplier_list': supplier_list
    })