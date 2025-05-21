from functools import wraps
from django.shortcuts import redirect

def admin_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        role = request.session.get('role')
        if role == 'admin':
            return view_func(request, *args, **kwargs)
        elif role:
            return redirect('403')
        return redirect('login')
    return wrapper

def both_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        role = request.session.get('role')
        if role in ['admin', 'sales']:
            return view_func(request, *args, **kwargs)
        elif role:
            return redirect('403')
        return redirect('login')
    return wrapper