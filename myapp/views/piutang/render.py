from django.shortcuts import render
from decorators import *

@both_required
def piutang(request):
    return render(request, 'piutang.html')

@admin_required
def tambah_bayarpiutang(request):
    return render(request, 'tambahpiutang.html')