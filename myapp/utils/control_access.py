from django.shortcuts import redirect, get_object_or_404
from .log_utils import log_user_action
from ..models.pesanan import Pesanan
from ..models.customer import Customer
from ..models.user import User

def pesanan_control_access(request, id=None):
    user_id = request.session.get("user_id")
    user = User.objects.get(id=user_id)

    if not user:
        return None
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

    status = request.GET.get('status', None)
    view_name = request.resolver_match.view_name
    if user.role != "admin":
        if id and view_name == "tambah_pesanan":
            pesanan = get_object_or_404(
                Pesanan.objects.select_related("customer_id__user_id"),
                id=id
            )
            self_pesanan = pesanan.customer_id.user_id.id
            log_user_action(request, action="Masuk Area Terlarang", detail=f"{user.role} {user.username} {'mencoba masuk pesanan sales lain' if self_pesanan != user.id else None}")
            return redirect("403") if self_pesanan != user.id else None

    # if status in ["pending", "ready"] and user.role == "sales":
    #     log_user_action(request, action="Masuk Area Terlarang", detail=f"{user.role} {user.username} mencoba masuk ke {status} pesanan")
    #     return redirect("403")
    return

def customer_control_access(request, id=None):
    user_id = request.session.get("user_id")
    user = User.objects.get(id=user_id)

    if not user:
        return None
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None
    
    view_name = request.resolver_match.view_name
    if user.role != "admin":
        if id and view_name == "tambah_customer":
            customer = get_object_or_404(
                Customer.objects.select_related("user_id"),
                id=id
            )
            self_customer = customer.user_id.id
            log_user_action(request, action="Masuk Area Terlarang", detail=f"{user.role} {user.username} {'mencoba melihat data customer sales lain' if self_customer != user.id else None}")
            return redirect("403") if self_customer != user.id else None
    return