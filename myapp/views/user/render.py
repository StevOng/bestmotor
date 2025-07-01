from django.shortcuts import render, redirect
from django.contrib import messages
from myapp.utils.decorators import admin_required
from myapp.utils.activity_logs import activity_logs
from ...models.user import User
from ...models.pesanan import *
from ...models.invoice import *

@activity_logs
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        try:
            user = User.objects.get(username=username)
            
            if user.password == password:
                request.session['username'] = user.username
                request.session['nama'] = user.nama
                request.session['role'] = user.role
                request.session['user_id'] = user.id
                if user.role == 'admin':
                    return redirect('dashboard')
                elif user.role == 'sales':
                    return redirect('bonus')
            else:
                messages.error(request, "Password salah")
                return redirect('login')
        except User.DoesNotExist:
            messages.error(request, 'Username tidak ditemukan')
            return redirect('login')

    return render(request, 'base/login.html')

@activity_logs
def logout_user(request):
    request.session.flush()
    return redirect('login')

@admin_required
@activity_logs
def dashboard(request):
    total_produk = Barang.objects.all().count()
    return render(request, "user/dashboard.html", {"total_produk": total_produk})