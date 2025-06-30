from ..models.user import User
from .log_utils import log_user_action

def activity_logs(request):
    method = request.method
    user_id = request.session.get("user_id")
    user = User.objects.get(id=user_id)
    path = request.path
    action = None
    detail = None
    act_obj = None

    keyword_action_map = {
        "pesanan": "Mengelola Pesanan",
        "customer": "Mengelola Customer",
        "barang": "Mengelola Barang",
        "penjualan": "Mengelola Penjualan",
        "login": "Mencoba Masuk",
        "logout": "Telah Keluar",
        "sales": "Mengelola Sales",
        "pembelian": "Mengelola Pembelian",
        "katalog": "Mengelola Katalog",
        "retur": "Mengelola Retur",
        "supplier": "Mengelola Supplier",
        "dashboard": "Mengelola Dashboard",
        "bantuan": "Mencari Bantuan",
        "403": "Terlarang!!",
        "404": "Terdampar!"
    }

    for keyword, mapped_action in keyword_action_map.items():
        if keyword in path:
            action = mapped_action
            act_obj = keyword
            break 

    if action:
        if method == "GET":
            detail = f"{user.role} {user.username} mengecek {act_obj} di halaman {path}"
            log_user_action(request, action=action, detail=detail)

        elif method == "POST":
            detail = f"{user.role} {user.username} membuat {act_obj} di halaman {path}"
            log_user_action(request, action=action, detail=detail )
        
        elif method in ["PATCH", "PUT"]:
            detail = f"{user.role} {user.username} mengedit {act_obj} di halaman {path}"
            log_user_action(request, action=action, detail=detail )

        elif method == "DELETE":
            detail = f"{user.role} {user.username} menghapus {act_obj} di halaman {path}"
            log_user_action(request, action=action, detail=detail )