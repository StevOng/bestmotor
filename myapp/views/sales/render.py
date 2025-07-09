from django.shortcuts import render
from django.db.models import Sum, Count
from myapp.utils.decorators import admin_required, both_required
from myapp.utils.activity_logs import activity_logs
from django.http import JsonResponse
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
    else:  # admin
        bonus = Bonus.objects.filter(user_id__role="sales").select_related("user_id").order_by("tanggal_cair")

    bonus_ids = bonus.values_list("id", flat=True)

    # Ambil semua BonusDetail sekaligus
    all_bonus_detail = BonusDetail.objects.filter(bonus_id__in=bonus_ids).select_related(
        "persen_bonus", "pesanan_id"
    )

    for b in bonus:
        detail = all_bonus_detail.filter(bonus_id=b.id)
        pesanan_ids = detail.values_list("pesanan_id", flat=True).distinct()
        b.total_pesanan = pesanan_ids.count()
        b.total_penjualan = Pesanan.objects.filter(id__in=pesanan_ids).aggregate(
            total=Sum("netto")
        )["total"] or 0
        b.total_bonus = detail.aggregate(
            total=Sum("nilai_bonus")
        )["total"] or 0
        b.detail_list = detail  # ✅ akses ini langsung di template

    return render(request, 'sales/sales.html', {
        "list": "bonus",
        "bonus": bonus,
        "role": role,
    })
    
@both_required
def bonus_detail_json(request, bonus_id):
    try:
        detail = BonusDetail.objects.filter(bonus_id=bonus_id).select_related("persen_bonus")
        data = []
        for d in detail:
            data.append({
                "nama_barang": d.nama_barang,
                "merk": d.merk,
                "persen_bonus": d.persen_bonus.persenan,
                "qty": d.qty,
                "harga": d.harga,
                "nilai_bonus": d.nilai_bonus,
            })
        return JsonResponse({"success": True, "data": data})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})

@admin_required
@activity_logs
def bonus_merek(request):
    persentase = PersenBonus.objects.all()
    return render(request, 'sales/sales.html', {"list":"merek", "persentase": persentase})