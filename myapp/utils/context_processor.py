from django.db.models import F
from ..models.barang import *
from ..models.faktur import *
from ..models.invoice import *

def user_context(request):
    return {
        'username': request.session.get('username'),
        'nama': request.session.get('nama'),
        'role': request.session.get('role')
    }

def notifications(request):
    notifikasi = []
    role = request.session.get('role')
    sales_id = request.session.get("user_id")
    low_stocks = Barang.objects.filter(stok__lte=F("stok_minimum")).all()
    faktur_jto = Faktur.objects.filter(status="jatuh_tempo").all()
    invoice_jto = Invoice.objects.filter(status="jatuh_tempo").all()

    if role == "admin":
        if low_stocks:
            for push_notif in low_stocks:
                notifikasi.append({
                    "head": "New alert from Barang",
                    "msg": f"Barang '{push_notif.nama_barang}' hampir habis sisa '{push_notif.stok}'"
                })

        if faktur_jto:
            for push_notif in faktur_jto:
                notifikasi.append({
                    "head": "Penagihan faktur sudah bisa diproses",
                    "msg": f"Faktur '{push_notif.no_faktur}' sudah jatuh tempo"
                })

        if invoice_jto:
            for push_notif in invoice_jto:
                notifikasi.append({
                    "head": "Pembayaran invoice sudah bisa diproses",
                    "msg": f"Invoice '{push_notif.no_invoice}' sudah jatuh tempo"
                })
    else:
        faktur_jto = Faktur.objects.filter(status="jatuh_tempo", pesanan_id__customer_id__user_id=sales_id)
        if faktur_jto:
            for push_notif in faktur_jto:
                notifikasi.append({
                    "head": "Penagihan faktur sudah bisa diproses",
                    "msg": f"Faktur '{push_notif.no_faktur}' sudah jatuh tempo"
                })
    return {"notifikasi": notifikasi}