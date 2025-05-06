from functools import wraps
from django.shortcuts import redirect

def admin_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if 'role' not in request.session:
            return redirect('login')
        
        role = request.session.get('role')
        if role == 'admin':
            return view_func(request, *args, **kwargs)
        else:
            return redirect('403')
    return wrapper

def both_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if 'role' not in request.session:
            return redirect('login')
        
        role = request.session.get('role')
        if role == 'admin' or role == 'sales':
            return view_func(request, *args, **kwargs)
        else:
            return redirect('403')
    return wrapper