from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.db.models import Prefetch
from ...models.faktur import Faktur
from ...decorators import *
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import cm
from django.conf import settings
import os
from io import BytesIO

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

@admin_required
def export_faktur(request, id):
    faktur = get_object_or_404(Faktur, pk=id)
    pesanan = faktur.pesanan_id
    detail_list = pesanan.detailpesanan_set.select_related("barang_id")
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="faktur_{faktur.no_faktur}.pdf"' #Ubah ke attachment, langsung download pdf

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # === Logo ===
    logo_path = os.path.join(settings.BASE_DIR, "static/images/logo.png")
    if os.path.exists(logo_path):
        p.drawImage(logo_path, 40, height - 110, width=3.5*cm, height=3.5*cm, mask='auto')

    # Header
    p.setFont("Helvetica-Bold", 12)
    p.drawString(150, height - 40, "Best Motor")
    p.setFont("Helvetica", 10)
    p.drawString(150, height - 55, "Jalan Taduan, Medan Deli")
    p.drawString(150, height - 70, "Sumatera Utara")
    p.drawString(150, height - 85, "21312")

    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawCentredString(width / 2, height - 120, "Faktur")

    # Info kiri dan kanan
    p.setFont("Helvetica", 10)
    p.drawString(40, height - 140, "Informasi Pengiriman :")
    p.drawString(40, height - 155, f"{pesanan.customer_id.nama, pesanan.customer_id.no_hp}")
    p.drawString(40, height - 170, f"{pesanan.customer_id.alamat_lengkap}")

    p.drawString(width - 200, height - 140, f"Tanggal Faktur : {faktur.tanggal_faktur}")
    p.drawString(width - 200, height - 155, f"No. Faktur         : {faktur.no_faktur}")
    p.drawString(width - 200, height - 170, f"Jatuh Tempo    : {pesanan.jatuh_tempo}")

    styles = getSampleStyleSheet()
    styleN = styles['Normal']
    
    # Tabel data
    data = [
        ["No", "Nama Barang", "Merk", "Harga Satuan", "Qty", "Diskon %", "Total"],
    ]
    
    for i, detail in enumerate(detail_list, start=1):
        data.append([
            str(i),
            Paragraph(detail.barang_id.nama_barang + "-" + detail.barang_id.tipe , styleN),
            detail.barang_id.merek,
            f"Rp {detail.barang_id.harga_jual:,.0f},-",
            int(detail.qty_pesan),
            f"Rp {detail.diskon_barang:,.0f},-",
            f"Rp {detail.total_harga_barang():,.0f},-"
    ])
    
    data += [[""] * 7] * 2
    
    data += [
        ["", "", "", "", "", "Total Produk", f"Rp {pesanan.bruto:,.0f},-"],
        ["", "", "", "", "", "Total Ongkir", f"{pesanan.ongkir:,.0f},-"],
        ["", "", "", "", "", "Diskon", f"{pesanan.diskon_pesanan:,.0f},-"],
        ["", "", "", "", "", "PPN", f"Rp {pesanan.ppn:,.0f},-"],
        ["", "", "", "", "", "Total", f"Rp {pesanan.netto:,.0f},-"],
    ]

    table = Table(data, colWidths=[1*cm, 5*cm, 3*cm, 3*cm, 1*cm, 2*cm, 3.5*cm])
    table.setStyle(TableStyle([
        ("ALIGN", (-1, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN", (-3, -5), (-3, -1), "RIGHT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LINEABOVE", (4, -5), (-1, -5), 0.5, colors.grey),
        ("LINEBELOW", (4, -2), (-1, -2), 0.5, colors.grey),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, colors.grey),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.grey),
    ]))

    table.wrapOn(p, width, height)
    w, h = table.wrap(0, 0)
    p.drawString(40, height - 200, "Rincian Pesanan")
    table.drawOn(p, 40, height - 210 - h)

    # Informasi Pembayaran
    p.setFont("Helvetica", 10)
    p.drawString(40, 100, "Informasi Pembayaran :")
    p.drawString(40, 85, "BCA (000 123 1111)")
    p.drawString(40, 70, "a/n Best Motor")

    p.showPage()
    p.save()

    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    return response

