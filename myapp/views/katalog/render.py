from django.shortcuts import render
from ...decorators import *

@admin_required
def admin_katalog(request):
    return render(request, 'adminkatalog.html')

@both_required
def katalog(request):
    categories = ["Mesin", "Kelistrikan", "Suspensi", "Transmisi", "Body", "Ban & Velg", "Knalpot", "Oli Motor", "Aksesoris"]
    return render(request, "katalog.html", {"categories": categories})

@both_required
def katalogbrg(request):
    categories = ["Mesin", "Kelistrikan", "Suspensi", "Transmisi", "Body", "Ban & Velg", "Knalpot", "Oli Motor", "Aksesoris"]
    return render(request, "katalogbrg.html", {"categories": categories})

@admin_required
def tambah_brgkatalog(request):
    return render(request, 'tambahkatalog.html')

@admin_required
def deskripsi(request):
    return render(request, "deskripsi.html")