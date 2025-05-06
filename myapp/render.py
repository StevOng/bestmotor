from django.shortcuts import render

# Create your views here.
def bantuan(request):
    return render(request, 'base/bantuan.html')

def halaman403(request):
    return render(request, 'base/403.html')

def halaman404(request):
    return render(request, 'base/404.html')