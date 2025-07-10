from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from myapp.utils.decorators import admin_required, both_required
from myapp.utils.activity_logs import activity_logs
from myapp.views.barang.tipe_choices import TIPE
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import cm
from django.conf import settings
from datetime import datetime, timedelta, date
from ...models.user import User
from ...models.faktur import Faktur
import os
from io import BytesIO

@both_required
@activity_logs
def faktur(request):
    status = request.GET.get("status", None)
    per_tgl = request.GET.get("per_tgl")
    role = request.session.get('role')
    user_id = request.session.get('user_id')

    def get_label_tipe(input):
        for value, label in TIPE:
            if input == value or input == label:
                return label
        return input

    list_faktur = Faktur.objects.prefetch_related('pesanan_id__detailpesanan_set').select_related("pesanan_id")
    
    if role == "sales" :
        list_faktur = list_faktur.filter(pesanan_id__customer_id__user_id=user_id)
    
    today = date.today()
    for faktur in list_faktur:
        pesanan = faktur.pesanan_id
        if pesanan.jatuh_tempo and pesanan.jatuh_tempo.date() <= today:
            if faktur.status == "belum_lunas":
                faktur.status = "jatuh_tempo"
                faktur.save(update_fields=["status"])
    
    if per_tgl:
        list_faktur = list_faktur.filter(
            pesanan__detailpesanan__jatuh_tempo=per_tgl
        ).distinct()

    if status == "belum_lunas":
        list_faktur = list_faktur.filter(status__in=["belum_lunas", "jatuh_tempo"])
    elif status:  # jika status != None dan != kosong string
        list_faktur = list_faktur.filter(status=status)
    
    return render(request, 'faktur/faktur.html', {'list_faktur': list_faktur})

@both_required
@activity_logs
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

    p.drawString(width - 200, height - 140, f"Tanggal Faktur : {faktur.tanggal_faktur.strftime('%Y-%m-%d %H:%M:%S')}")
    p.drawString(width - 200, height - 155, f"No. Faktur         : {faktur.no_faktur}")
    p.drawString(width - 200, height - 170, f"Jatuh Tempo    : {pesanan.jatuh_tempo.strftime('%Y-%m-%d %H:%M:%S')}")

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
            detail.barang_id.merk,
            f"Rp {detail.barang_id.harga_jual:,.0f},-",
            int(detail.qty_pesan),
            f"Rp {detail.diskon_barang:,.0f},-",
            f"Rp {detail.total_harga_barang():,.0f},-"
    ])
    
    data += [[""] * 7] * 2
    
    data += [
        ["", "", "", "", "", "Total Produk", f"Rp {pesanan.bruto:,.0f},-"],
        ["", "", "", "", "", "Total Ongkir", f"Rp {pesanan.ongkir:,.0f},-"],
        ["", "", "", "", "", "Diskon", f"Rp {pesanan.diskon_pesanan:,.0f},-"],
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
    table_y = height - 210 - h
    
    if height - 210 - h < 50:
        p.showPage()
        table_y = height - 100 - h
    
    p.drawString(40, height - 200, "Rincian Pesanan")
    table.drawOn(p, 40, table_y)

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

@admin_required
def export_faktur_filter(request):
    sales_id = request.GET.get("salesId")
    dari_tgl = request.GET.get("dari_tgl")
    smpe_tgl = request.GET.get("smpe_tgl")
    from_tgl = datetime.strptime(dari_tgl, "%Y-%m-%d")
    to_tgl = datetime.strptime(smpe_tgl, "%Y-%m-%d") + timedelta(days=1)

    if not sales_id or not dari_tgl or not smpe_tgl:
        return HttpResponse("Filter tidak lengkap", status=400)

    try:
        sales_user = User.objects.get(id=sales_id)
    except User.DoesNotExist:
        return HttpResponse("Sales tidak ditemukan", status=404)

    faktur_list = Faktur.objects.filter(
        pesanan_id__customer_id__user_id=sales_id,
        tanggal_faktur__gte=from_tgl,
        tanggal_faktur__lt=to_tgl
    ).select_related("pesanan_id__customer_id")

    # Setup PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'inline; filename="faktur_filtered.pdf"'

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
    p.drawCentredString(width / 2, height - 120, "Laporan Faktur")
    
    # Info kiri dan kanan
    p.setFont("Helvetica", 10)
    p.drawString(40, height - 140, "Informasi Sales :")
    p.drawString(40, height - 155, f"Sales ID: {sales_id}")
    p.drawString(40, height - 170, f"Nama Sales: {sales_user.nama}")
    
    p.drawString(width - 200, height - 140, f"Periode: {dari_tgl} s/d {smpe_tgl}")

    # Tabel
    data = [["No Faktur", "Tgl Faktur", "No Referensi", "Customer", "Total"]]
    total_faktur = 0
    for i, f in enumerate(faktur_list, 1):
        data.append([
            f.no_faktur,
            str(f.tanggal_faktur.strftime('%Y-%m-%d')),
            f.pesanan_id.no_referensi.upper(),
            f.pesanan_id.customer_id.nama if f.pesanan_id.customer_id else "-",
            f"Rp {f.pesanan_id.netto:,.0f},-"
        ])
        total_faktur += f.pesanan_id.netto
    
    data += [[""] * 5] * 2
    
    data += [
        ["", "", "", "Total", f"Rp {total_faktur:,.0f},-"],
    ]

    table = Table(data, colWidths=[3.5*cm, 3*cm, 5*cm, 3*cm, 4*cm])
    table.setStyle(TableStyle([
        ("ALIGN", (-1, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN", (-2, -1), (-1, -1), "RIGHT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LINEABOVE", (3, -1), (-1, -1), 0.5, colors.grey),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, colors.grey),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.grey),
    ]))

    table.wrapOn(p, width, height)
    w, h = table.wrap(0, 0)
    table_y = height - 210 - h
    
    if height - 210 - h < 50:
        p.showPage()
        table_y = height - 100 - h
    
    p.drawString(40, height - 200, "Rincian Pesanan")
    table.drawOn(p, 40, table_y)

    p.showPage()
    p.save()
    response.write(buffer.getvalue())
    buffer.close()

    return response
