from django.shortcuts import render
from django.db.models import Sum
from ...decorators import admin_required
from ...models.hutang import *
from ...models.invoice import *

@admin_required
def hutang(request):
    hutang = Hutang.objects.select_related('supplier_id')

    for hut in hutang:
        hut.total_invoice = hut.invoice_set.aggregate(total=Sum('netto'))['total'] or 0
    return render(request, 'hutang/hutang.html', {'hutang': hutang})

@admin_required
def tambah_bayarhutang(request, id=None):
    hutang = None
    invoices = Invoice.objects.filter(status__in=['belum_lunas', 'jatuh_tempo']).prefetch_related('hutang', 'detailinvoice_set').select_related('supplier_id')

    if id:
        hutang = Hutang.objects.select_related('supplier_id').get(id=id)
        hutang.total_invoice = hutang.invoice_set.aggregate(total=Sum('netto'))['total'] or 0
        hutang.nilai_byr = HutangInvoice.objects.filter(hutang=hutang).values_list('nilai_bayar', flat=True)
    return render(request, 'hutang/tambahhutang.html', {'hutang': hutang, 'invoices': invoices})