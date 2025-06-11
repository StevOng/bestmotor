import openpyxl
from openpyxl.utils import get_column_letter
from django.http import HttpResponse
from django.shortcuts import render
from django.utils.dateparse import parse_date
from django.db.models import Sum, Q
from ...decorators import *
from ...models.barang import *

@both_required
def barang(request):
    filter = request.GET.get('filter')
    dari = request.GET.get('dari_tgl')
    sampe = request.GET.get('smpe_tgl')

    barang = Barang.objects.none()

    if filter == "laku" and dari and sampe:
        barang = get_barang_laku(dari, sampe)
    elif filter == "rendah":
        barang = Barang.objects.filter(stok__lt=models.F('stok_minimum'))
    else:
        barang = Barang.objects.prefetch_related('detailpesanan_set').all()

    for brg in barang:
        brg.total_pesanan = sum(d.qty_pesan for d in brg.detailpesanan_set.all())
        brg.qty_siap_jual = brg.stok - brg.total_pesanan
        brg.selisih = brg.stok_minimum - brg.qty_siap_jual

    return render(request, 'barang/barang.html', {'barang': barang,'filter': filter})

@admin_required
def tambah_barang(request, id=None):
    barang = None

    if id:
        barang = Barang.objects.get(id=id)
    return render(request, 'barang/tambahbrg.html', {'detail_barang': barang})

def get_barang_laku(dari, sampe):
    dari = parse_date(dari)
    sampe = parse_date(sampe)

    return Barang.objects.annotate(total_terjual=Sum(
        'detailpesanan_qty_pesan',
        filter=Q(detailpesanan__tanggal_pesanan__range=[dari,sampe])
    )).filter(total_terjual__gt=0)

def export_excel(request):
    work_book = openpyxl.Workbook()
    work_sheet = work_book.active
    work_sheet.title = "List Barang"

    col_heads = [
        'No',
        'Kode Barang',
        'Nama Barang',
        'Tipe Motor',
        'Merk',
        'Harga Jual',
        'Stok Minimum',
        'Min Qty Grosir',
        'Harga Satuan',
        'Harga Modal',
        'Stok',
        'Qty Terjual',
        'Keterangan'
    ]
    work_sheet.append(col_heads)

    for idx, detail in enumerate(Barang.objects.all(), start=1):
        work_sheet.append([
            idx,
            detail.kode_barang,
            detail.nama_barang,
            detail.tipe,
            detail.merk,
            detail.harga_jual,
            detail.stok_minimum,
            detail.tierharga_set.min_qty_grosir,
            detail.tierharga_set.harga_satuan,
            detail.harga_modal,
            detail.stok,
            detail.qty_terjual,
            detail.keterangan
        ])

    for col in work_sheet.columns: # atur lebar kolom di excel
        max_length = max(len(str(cell.value)) for cell in col)
        work_sheet.column_dimensions[get_column_letter(col[0].column)].width = max_length + 2

    response = HttpResponse(
        content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename=barang.xlsx'
    return response