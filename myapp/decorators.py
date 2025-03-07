from functools import wraps
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

def admin_required(view_func):
    @wraps(view_func)
    @login_required
    def wrapper(request, *args, **kwargs):
        if 'user_type' not in request.session:
            return redirect('login')
        
        user_type = request.session.get('user_type')
        if user_type == 'admin':
            return view_func(request, *args, **kwargs)
        else:
            return redirect('403')
    return wrapper

def both_required(view_func):
    @wraps(view_func)
    @login_required
    def wrapper(request, *args, **kwargs):
        if 'user_type' not in request.session:
            return redirect('login')
        
        user_type = request.session.get('user_type')
        if user_type == 'admin' or user_type == 'sales':
            return view_func(request, *args, **kwargs)
        else:
            return redirect('403')
    return wrapper