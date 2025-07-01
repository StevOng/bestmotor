from django.shortcuts import render, get_object_or_404
from django.db.models import Sum
from myapp.utils.decorators import admin_required
from myapp.utils.activity_logs import activity_logs
from ...models.hutang import *
from ...models.invoice import *

@admin_required
@activity_logs
def hutang(request):
    hutang = Hutang.objects.select_related('supplier_id')

    for hut in hutang:
        hut.total_invoice = hut.invoice.aggregate(total=Sum('netto'))['total'] or 0
    return render(request, 'hutang/hutang.html', {'hutang': hutang})

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
    return render(request, 'hutang/tambahhutang.html', {
        'hutang': hutang,
        'data_hi': data_hi,
        'invoices': invoices,
        'supplier_list': supplier_list
    })