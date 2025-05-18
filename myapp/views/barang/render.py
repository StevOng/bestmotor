import openpyxl
from openpyxl.utils import get_column_letter
from django.http import HttpResponse
from django.shortcuts import render
from django.utils.dateparse import parse_date
from django.db.models import Sum, Q
from ...decorators import *
from ...models.barang import *
from ...models.invoice import DetailInvoice

@both_required
def barang(request):
    filter = request.GET.get('filter')
    dari = request.GET.get('dari_tgl')
    sampe = request.GET.get('smpe_tgl')

    if filter == "laku":
        detailBrg = get_barang_laku(dari, sampe)
    elif filter == "rendah":
        detailBrg = DetailBarang.objects.filter(stok__lt=models.F('stok_minimum'))
    else:
        detailBrg = DetailBarang.objects.select_related('barang_id').prefetch_related('barang_id__detailpesanan_set').all()

    # Ambil semua DetailInvoice dulu
    invoices = DetailInvoice.objects.select_related('barang_id').order_by('barang_id', '-created_at')

    # Bikin dict barang_id -> harga_beli
    harga_modal_map = {}
    for inv in invoices:
        if inv.barang_id not in harga_modal_map:
            harga_modal_map[inv.barang_id] = inv.harga_beli

    # Loop detailBrg dan pasangkan harga_modal
    for brg in detailBrg:
        brg.total_pesanan = sum(d.qty_pesan for d in brg.barang.detailpesanan_set.all())
        brg.harga_modal = harga_modal_map.get(brg.barang_id, 0)

    return render(request, 'barang/barang.html', {'barang': detailBrg,'filter': filter})

@admin_required
def tambah_barang(request, id=None):
    barang = None
    detail_barang = None
    if id:
        barang = Barang.objects.get(id=id)
        detail_barang = barang.detailbarang__set.first() if barang else None
    return render(request, 'barang/tambahbrg.html', {'detail_barang': detail_barang})

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
        'Kategori',
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

    for idx, detail in enumerate(DetailBarang.objects.select_related('barang_id').all(), start=1):
        work_sheet.append([
            idx,
            detail.barang_id.kode_barang,
            detail.barang_id.nama_barang,
            detail.kategori,
            detail.merk,
            detail.harga_jual,
            detail.stok_minimum,
            detail.min_qty_grosir,
            detail.harga_satuan,
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