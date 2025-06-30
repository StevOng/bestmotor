from django.db.models.signals import post_save
from django.dispatch import receiver
from types import SimpleNamespace
from .models.pesanan import Pesanan
from .models.faktur import Faktur
from .models.bonus import BonusDetail
from .views.sales.api import BonusViewSet

@receiver(post_save, sender=Pesanan)
def create_faktur_and_bonus(sender, instance, created, **kwargs):
    print(f"[SIGNAL] Pesanan {instance.id} status: {instance.status}, created: {created}")

    if instance.status == 'shipped':
        # Buat Faktur jika belum ada
        if not Faktur.objects.filter(pesanan_id=instance).exists():
            Faktur.objects.create(
                pesanan_id=instance,
                sisa_bayar=instance.netto,
                total=instance.netto
            )

        # Buat Bonus jika belum ada dan customer adalah sales
        if not BonusDetail.objects.filter(pesanan_id=instance.id).exists():
            if instance.customer_id.user_id.role == 'sales':
                try:
                    request_mock = SimpleNamespace(session={'user_id': instance.customer_id.user_id_id})
                    viewset = BonusViewSet()
                    viewset.request = request_mock
                    viewset.create_sales_bonus()
                except Exception as e:
                    print("Gagal membuat bonus:", e)
            else:
                print(f"Customer {instance.customer_id.id} bukan sales, bonus tidak dibuat.")

    elif instance.status == 'cancelled':
        if hasattr(instance, 'faktur'):
            instance.faktur.delete()
