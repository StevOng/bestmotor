from django.shortcuts import render, redirect
from django.contrib import messages
from ...models.user import *
from ...decorators import admin_required

def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        try:
            admin = Admin.objects.get(username=username)
            if admin.password == password:
                request.session['role'] = 'admin'
                request.session['user_id'] = admin.id
                return redirect('dashboard')
            else:
                messages.error(request, "Password salah")
                return redirect('login')
        except Admin.DoesNotExist:
            try:
                sales = Sales.objects.get(username=username)
                if sales.password == password:
                    request.session['role'] = 'sales'
                    request.session['user_id'] = sales.id
                    return redirect('katalog')
                else:
                    messages.error(request, "Password salah")
                    return redirect('login')
            except Sales.DoesNotExist:
                messages.error(request, "Username tidak ditemukan")
                return redirect('login')

    return render(request, 'login.html')

@admin_required
def dashboard(request):
    return render(request, 'dashboard.html')