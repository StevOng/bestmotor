from django.shortcuts import render
from django.db.models import Sum, Count
from myapp.utils.decorators import admin_required, both_required
from ...models.barang import *
from ...models.user import User
from ...models.bonus import *

@admin_required
def sales(request):
    users = User.objects.filter(role="sales")
    return render(request, 'sales/sales.html', {"users": users})

@both_required
def bonus(request):
    user_id = request.session.get("user_id")
    role = request.session.get("role")
    if role == "sales":
        bonus = Bonus.objects.filter(user_id=user_id).order_by("tanggal_cair")
    else:
        bonus = Bonus.objects.filter(user_id__role="sales").order_by("tanggal_cair")
    bonus_detail = BonusDetail.objects.select_related("bonus_id", "persen_bonus", "pesanan_id", "detail_pesanan_id").filter(bonus_id__in=bonus)
    total = bonus_detail.aggregate(
        total_pesanan = Count("pesanan_id"),
        total_penjualan = Sum("pesanan_id__netto")
    )
    return render(request, 'sales/sales.html', {"list":"bonus","bonus": bonus, "bonus_detail": bonus_detail, "total_pesanan": total["total_pesanan"], "total_penjualan": total["total_penjualan"]})

@admin_required
def bonus_merek(request):
    persentase = PersenBonus.objects.select_related("barang_id")
    return render(request, 'sales/sales.html', {"list":"merek", "persentase": persentase})