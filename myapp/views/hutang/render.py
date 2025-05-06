from django.shortcuts import render
from ...decorators import admin_required

@admin_required
def hutang(request):
    return render(request, 'hutang/hutang.html')

@admin_required
def tambah_bayarhutang(request):
    return render(request, 'hutang/tambahhutang.html')