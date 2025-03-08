from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from .models import Admin, Sales
from .decorators import admin_required, both_required

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

@both_required
def katalog(request):
    categories = ["Mesin", "Kelistrikan", "Suspensi", "Transmisi", "Body", "Ban & Velg", "Knalpot", "Oli Motor", "Aksesoris"]
    return render(request, "katalog.html", {"categories": categories})

@both_required
def katalogbrg(request):
    categories = ["Mesin", "Kelistrikan", "Suspensi", "Transmisi", "Body", "Ban & Velg", "Knalpot", "Oli Motor", "Aksesoris"]
    return render(request, "katalogbrg.html", {"categories": categories})

@admin_required
def deskripsi(request):
    return render(request, "deskripsi.html")

@admin_required
def dashboard(request):
    return render(request, 'dashboard.html')

@both_required
def pesanan(request):
    return render(request, 'pesanan.html', {"halaman": "Data Semua Pesanan"})

@both_required
def pesanan_tunda(request):
    return render(request, 'pesanan.html', {"halaman": "Data Pesanan Tertunda"})

@both_required
def pesanan_ready(request):
    return render(request, 'pesanan.html', {"halaman": "Data Pesanan Siap Kirim"})

@both_required
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

@both_required
def barang(request):
    return render(request, 'barang.html')

@both_required
def barang_rendah(request):
    return render(request, 'barang.html')

@both_required
def barang_laku(request):
    return render(request, 'barang.html')

@admin_required
def admin_katalog(request):
    return render(request, 'adminkatalog.html')

@admin_required
def tambah_brgkatalog(request):
    return render(request, 'tambahkatalog.html')

@both_required
def tambah_barang(request):
    return render(request, 'tambahbrg.html')

@admin_required
def transaksi_masuk(request):
    return render(request, 'transaksi.html')

@admin_required
def transaksi_keluar(request):
    return render(request, 'transaksi.html')

@admin_required
def tambah_masuk(request):
    return render(request, 'tambahtransaksi.html')

@admin_required
def tambah_keluar(request):
    return render(request, 'tambahtransaksi.html')

@admin_required
def supplier(request):
    return render(request, 'supplier.html')

@admin_required
def tambah_supplier(request):
    return render(request, 'tambahsupplier.html')

@both_required
def customer(request):
    return render(request, 'customer.html')

@both_required
def tambah_customer(request):
    return render(request, 'tambahcust.html')

@admin_required
def invoice(request):
    return render(request, 'invoice.html')

@admin_required
def invoice_belum(request):
    return render(request, 'invoice.html')

@admin_required
def invoice_jatuh(request):
    return render(request, 'invoice.html')

@admin_required
def tambah_invoice(request):
    return render(request, 'tambahinvoice.html')

@admin_required
def retur_beli(request):
    return render(request, 'returbeli.html')

@admin_required
def tambah_returbeli(request):
    return render(request, 'tambahreturbeli.html')

@admin_required
def hutang(request):
    return render(request, 'hutang.html')

@admin_required
def tambah_bayarhutang(request):
    return render(request, 'tambahhutang.html')

@both_required
def faktur(request):
    return render(request, 'faktur.html')

@both_required
def faktur_belum(request):
    return render(request, 'faktur.html')

@both_required
def faktur_jatuh(request):
    return render(request, 'faktur.html')

@both_required
def retur_jual(request):
    return render(request, 'returjual.html')

@both_required
def tambah_returjual(request):
    return render(request, 'tambahreturjual.html')

@both_required
def piutang(request):
    return render(request, 'piutang.html')

@both_required
def tambah_bayarpiutang(request):
    return render(request, 'tambahpiutang.html')

def bantuan(request):
    return render(request, 'bantuan.html')

def halaman403(request):
    return render(request, '403.html')

def halaman404(request):
    return render(request, '404.html')