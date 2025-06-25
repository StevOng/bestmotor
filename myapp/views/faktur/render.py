from django.shortcuts import render
from django.template.loader import render_to_string
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Prefetch
from ...models.faktur import Faktur
from ...decorators import *
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import cm

@both_required
def faktur(request):
    status = request.GET.get("status", None)
    per_tgl = request.GET.get("per_tgl")

    list_faktur = Faktur.objects.select_related('pesanan_id').prefetch_related(
        Prefetch('pesanan__detailpesanan_set')
    )
    
    if per_tgl:
        list_faktur = list_faktur.filter(
            pesanan__detailpesanan__jatuh_tempo=per_tgl
        ).distinct()

    if status:
        list_faktur = list_faktur.filter(status=status)
    return render(request, 'faktur/faktur.html', {'list_faktur': list_faktur})

# @admin_required
# def preview_static_faktur(request):
#     contoh_barang = [
#         {"nama": "Oli Top1", "qty": 2, "harga": 45000, "total": 90000},
#         {"nama": "Busi", "qty": 4, "harga": 15000, "total": 60000},
#         {"nama": "Aki GS", "qty": 1, "harga": 300000, "total": 300000},
#         {"nama": "Aki GS", "qty": 1, "harga": 300000, "total": 300000},
#         {"nama": "Aki GS", "qty": 1, "harga": 300000, "total": 300000},
#     ]

#     context = {
#         "no_faktur": "BJ20088",
#         "tanggal": timezone.now(),
#         "customer": {"nama": "Steven Ongki"},
#         "status": "belum_lunas",
#         "barang_list": contoh_barang,
#         "potongan": 10000,
#         "total_harga": 450000,
#         "sisa_bayar": 200000,
#     }

#     return render(request, "faktur/export_faktur.html", context)

@admin_required
def export_faktur(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="faktur_static.pdf"'

    p = canvas.Canvas(response, pagesize=landscape(A4))
    width, height = landscape(A4)

    # Judul di tengah
    p.setFont("Helvetica-Bold", 16)
    p.drawCentredString(width / 2, height - 40, "Faktur Penjualan")

    # Info statis
    p.setFont("Helvetica", 12)
    x_info = width / 2
    y_info = height - 80
    p.drawString(x_info - 340, y_info, "No Faktur  : BJ20015")
    p.drawString(x_info - 340, y_info - 20, "Customer  : PT. Sejahtera Abadi")
    p.drawString(x_info - 340, y_info - 40, "Status        : Belum Lunas")
    
    p.drawString(x_info + 200, y_info, "Tanggal         : 25/06/2025")
    p.drawString(x_info + 200, y_info - 20, "TOP               : 5 Hari")
    p.drawString(x_info + 200, y_info - 40, "Jatuh Tempo : 30/06/2025")

    # Data barang statis
    data = [["Nama Barang", "Qty", "Harga", "Total"],
            ["Nama Barang", "Qty", "Harga", "Total"],
            ["Nama Barang", "Qty", "Harga", "Total"],
            ["Nama Barang", "Qty", "Harga", "Total"],]

    col_widths = [10 * cm, 4 * cm, 5 * cm, 5 * cm]
    total_table_width = sum(col_widths)
    x_table = (width - total_table_width) / 2
    y_table = (y_info - 50) - (len(data) * 20)

    table = Table(data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 0.8, colors.grey),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))

    table.wrapOn(p, width, height)
    table.drawOn(p, x_table, y_table)

    # Ringkasan statis
    p.drawRightString(width - 80, y_table - 20, "Potongan     : 10.000")
    p.drawRightString(width - 80, y_table - 40, "Total Harga  : 410.000")
    p.drawRightString(width - 80, y_table - 60, "Sisa Bayar   : 200.000")

    # Footer
    p.setFont("Helvetica-Oblique", 10)
    p.drawCentredString(width / 2, 50, "Terima kasih telah berbelanja di Best Motor.")

    p.showPage()
    p.save()
    return response
