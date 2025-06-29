from django.db.models.signals import post_save
from django.dispatch import receiver
from types import SimpleNamespace
from .models.pesanan import Pesanan
from .models.faktur import Faktur
from .models.bonus import BonusDetail
from .views.sales.api import BonusViewSet

@receiver(post_save, sender=Pesanan)
def create_faktur_and_bonus(sender, instance, **kwargs):
    print(f"[SIGNAL] Pesanan {instance.id} status: {instance.status}")

    if instance.status == 'shipped':
        # Buat Faktur jika belum ada
        if not hasattr(instance, 'faktur'):
            Faktur.objects.create(
                pesanan_id=instance,
                sisa_bayar=instance.netto,
                total=instance.netto
            )

        # Buat Bonus jika belum ada
        if not BonusDetail.objects.filter(pesanan_id=instance.id).exists():
            try:
                request_mock = SimpleNamespace(session={'user_id': instance.customer_id.user_id_id})
                viewset = BonusViewSet()
                viewset.request = request_mock
                viewset.create_sales_bonus()
            except Exception as e:
                print("Gagal membuat bonus:", e)

    elif instance.status == 'cancelled':
        if hasattr(instance, 'faktur'):
            instance.faktur.delete()
