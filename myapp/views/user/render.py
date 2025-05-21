from django.shortcuts import render, redirect
from django.contrib import messages
from ...models.user import *
from ...decorators import admin_required

def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        try:
            user = User.objects.get(username=username)
            if user.password == password:
                request.session['role'] = user.role
                request.session['user_id'] = user.id
                if user.role == 'admin':
                    return redirect('dashboard')
                elif user.role == 'sales':
                    return redirect('katalog')
            else:
                messages.error(request, "Password salah")
                return redirect('login')
        except User.DoesNotExist:
            messages.error(request, 'Username tidak ditemukan')
            return redirect('login')

    return render(request, 'base/login.html')

@admin_required
def dashboard(request):
    return render(request, 'user/dashboard.html')