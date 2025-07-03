from django.shortcuts import render
from django.db.models import Sum, Count
from myapp.utils.decorators import admin_required, both_required
from myapp.utils.activity_logs import activity_logs
from ...models.barang import *
from ...models.user import User
from ...models.bonus import *

@admin_required
@activity_logs
def sales(request):
    users = User.objects.filter(role="sales")
    return render(request, 'sales/sales.html', {"users": users})

@both_required
@activity_logs
def bonus(request):
    user_id = request.session.get("user_id")
    role = request.session.get("role")
    if role == "sales":
        bonus = Bonus.objects.filter(user_id=user_id).order_by("tanggal_cair")
    else:
        bonus = Bonus.objects.filter(user_id__role="sales").order_by("tanggal_cair")
    bonus_detail = BonusDetail.objects.select_related("bonus_id", "persen_bonus", "pesanan_id", "detail_pesanan_id").filter(bonus_id__in=bonus)
    total_pesanan = bonus_detail.values("pesanan_id").distinct().count()
    total_penjualan = Pesanan.objects.filter(id__in=bonus_detail.values_list("pesanan_id", flat=True).distinct()).aggregate(
        total_penjualan=Sum("netto")
    )["total_penjualan"] or 0
    return render(request, 'sales/sales.html', {"list":"bonus","bonus": bonus, "bonus_detail": bonus_detail, "total_pesanan": total_pesanan, "total_penjualan": total_penjualan})

@admin_required
@activity_logs
def bonus_merek(request):
    persentase = PersenBonus.objects.all()
    return render(request, 'sales/sales.html', {"list":"merek", "persentase": persentase})