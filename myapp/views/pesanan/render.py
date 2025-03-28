from django.shortcuts import render
from ...decorators import both_required

@both_required
def pesanan(request):
    return render(request, 'pesanan.html')

@both_required
def tambah_pesanan(request):
    if request.method == "GET" and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        barang_data = [
            {"kode": "BR01", "nama": "Rem Honda Vario 3X", "harga": 10000},
            {"kode": "B02", "nama": "Barang 2", "harga": 20000},
            {"kode": "B03", "nama": "Barang 3", "harga": 30000},
            {"kode": "B04", "nama": "Barang 4", "harga": 40000},
        ]
    return render(request, 'tambahpesan.html')