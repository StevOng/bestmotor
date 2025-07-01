from functools import wraps
from django.shortcuts import get_object_or_404
from ..models.user import User
from .log_utils import log_user_action

def activity_logs(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        method   = request.method
        user_id  = request.session.get("user_id")

        if not user_id:
            user = "Guest"
            role = "Guest"
            username = "Bestmotor"
        else:
            user = User.objects.get(id=user_id)
            role = user.role
            username = user.username
        
        path     = request.path
        action   = None
        detail   = None
        act_obj  = None

        keyword_action_map = {
            "pesanan":    "Mengelola Pesanan",
            "customer":   "Mengelola Customer",
            "barang":     "Mengelola Barang",
            "penjualan":  "Mengelola Penjualan",
            "login":      "Mencoba Masuk",
            "logout":     "Telah Keluar",
            "sales":      "Mengelola Sales",
            "pembelian":  "Mengelola Pembelian",
            "katalog":    "Mengelola Katalog",
            "retur":      "Mengelola Retur",
            "supplier":   "Mengelola Supplier",
            "dashboard":  "Mengelola Dashboard",
            "bantuan":    "Mencari Bantuan",
            "403":        "Terlarang!!",
            "404":        "Terdampar!"
        }

        for keyword, mapped_action in keyword_action_map.items():
            if keyword in path:
                action  = mapped_action
                act_obj = keyword
                break

        if action:
            if method == "GET":
                detail = f"{role} {username} mengecek {act_obj} di halaman {path}"
            elif method == "POST":
                detail = f"{role} {username} membuat {act_obj} di halaman {path}"
            elif method in ["PATCH", "PUT"]:
                detail = f"{role} {username} mengedit {act_obj} di halaman {path}"
            elif method == "DELETE":
                detail = f"{role} {username} menghapus {act_obj} di halaman {path}"
            if detail:
                log_user_action(request, action=action, detail=detail)

        return view_func(request, *args, **kwargs)
    return wrapper