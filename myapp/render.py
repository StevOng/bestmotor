from django.shortcuts import render
from myapp.utils.activity_logs import activity_logs

# Create your views here.
@activity_logs
def bantuan(request):
    return render(request, 'base/bantuan.html')

@activity_logs
def halaman403(request):
    return render(request, 'base/403.html')

@activity_logs
def halaman404(request):
    return render(request, 'base/404.html')