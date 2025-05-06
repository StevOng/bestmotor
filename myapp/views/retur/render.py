from django.shortcuts import render
from ...decorators import *

@both_required
def retur_jual(request):
    return render(request, 'retur/returjual.html')

@both_required
def tambah_returjual(request):
    return render(request, 'retur/tambahreturjual.html')

@admin_required
def retur_beli(request):
    return render(request, 'retur/returbeli.html')

@admin_required
def tambah_returbeli(request):
    return render(request, 'retur/tambahreturbeli.html')