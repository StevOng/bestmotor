from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from .models import Admin, Sales

# Create your views here.
def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        try:
            admin = Admin.objects.get(username=username)
            if admin.password == password:
                request.session['user_type'] = 'admin'
                request.session['user_id'] = admin.id
                return redirect('dashboard')
            else:
                messages.error(request, "Password salah")
        except Admin.DoesNotExist:
            pass

        try:
            sales = Sales.objects.get(username=username)
            if sales.password == password:
                request.session['user_type'] = 'sales'
                request.session['user_id'] = sales.id
                return redirect('katalog')
            else:
                messages.error(request, "Password salah")
        except Sales.DoesNotExist:
            messages.error(request, "Username tidak ditemukan")

    return render(request, 'login.html')

def katalog(request):
    categories = ["Mesin", "Kelistrikan", "Suspensi", "Transmisi", "Body", "Ban & Velg", "Knalpot", "Oli Motor", "Aksesoris"]
    return render(request, "katalog.html", {"categories": categories})

def katalogbrg(request):
    categories = ["Mesin", "Kelistrikan", "Suspensi", "Transmisi", "Body", "Ban & Velg", "Knalpot", "Oli Motor", "Aksesoris"]
    return render(request, "katalogbrg.html", {"categories": categories})

def deskripsi(request):
    return render(request, "deskripsi.html")

def dashboard(request):
    return render(request, 'dashboard.html')

def pesanan(request):
    return render(request, 'pesanan.html', {"halaman": "Data Semua Pesanan", 'icon': 'fa-trash-can', 'iconcolor': 'text-red-500', 'action': 'Hapus'})

def pesanan_tunda(request):
    return render(request, 'pesanan.html', {"halaman": "Data Pesanan Tertunda", 'icon': 'fa-square-check', 'iconcolor': 'text-green-500', 'action': 'Terima Pesanan'})

def pesanan_ready(request):
    return render(request, 'pesanan.html', {"halaman": "Data Pesanan Siap Kirim", 'icon': 'fa-trash-can', 'iconcolor': 'text-red-500', 'action': 'Hapus'})

def tambah_pesanan(request):
    if request.method == "GET" and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        barang_data = [
            {"kode": "BR01", "nama": "Rem Honda Vario 3X", "harga": 10000},
            {"kode": "B02", "nama": "Barang 2", "harga": 20000},
            {"kode": "B03", "nama": "Barang 3", "harga": 30000},
            {"kode": "B04", "nama": "Barang 4", "harga": 40000},
        ]
        return JsonResponse(barang_data, safe=False)
    return render(request, 'tambahpesan.html')

def barang(request):
    return render(request, 'barang.html')

def barang_rendah(request):
    return render(request, 'barang.html')

def barang_laku(request):
    return render(request, 'barang.html')

def admin_katalog(request):
    return render(request, 'adminkatalog.html')

def tambah_brgkatalog(request):
    return render(request, 'tambahkatalog.html')

def tambah_barang(request):
    return render(request, 'tambahbrg.html')

def transaksi_masuk(request):
    return render(request, 'transaksi.html')

def transaksi_keluar(request):
    return render(request, 'transaksi.html')

def tambah_masuk(request):
    return render(request, 'tambahtransaksi.html')

def tambah_keluar(request):
    return render(request, 'tambahtransaksi.html')

def supplier(request):
    return render(request, 'supplier.html')

def tambah_supplier(request):
    return render(request, 'tambahsupplier.html')

def customer(request):
    return render(request, 'customer.html')

def tambah_customer(request):
    return render(request, 'tambahcust.html')

def invoice(request):
    return render(request, 'invoice.html')

def invoice_belum(request):
    return render(request, 'invoice.html')

def invoice_jatuh(request):
    return render(request, 'invoice.html')

def tambah_invoice(request):
    return render(request, 'tambahinvoice.html')

def retur_beli(request):
    return render(request, 'returbeli.html')

def tambah_returbeli(request):
    return render(request, 'tambahreturbeli.html')

def hutang(request):
    return render(request, 'hutang.html')

def tambah_bayarhutang(request):
    return render(request, 'tambahhutang.html')

def faktur(request):
    return render(request, 'faktur.html')

def faktur_belum(request):
    return render(request, 'faktur.html')

def faktur_jatuh(request):
    return render(request, 'faktur.html')

def retur_jual(request):
    return render(request, 'returjual.html')

def tambah_returjual(request):
    return render(request, 'tambahreturjual.html')

def piutang(request):
    return render(request, 'piutang.html')

def tambah_bayarpiutang(request):
    return render(request, 'tambahpiutang.html')

def bantuan(request):
    return render(request, 'bantuan.html')