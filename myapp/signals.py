from django.db.models.signals import post_save
from django.dispatch import receiver
from .models.pesanan import Pesanan
from .models.faktur import Faktur
from .models.bonus import BonusDetail
from .views.sales.api import BonusViewSet

@receiver(post_save, sender=Pesanan)
def create_faktur_and_bonus(sender, instance, **kwargs):
    if instance.status == 'shipped':
        # Buat Faktur jika belum ada
        if not hasattr(instance, 'faktur'):
            Faktur.objects.create(
                pesanan_id=instance.id,
                sisa_bayar=instance.netto,
                total=instance.netto
            )

        # Cek apakah sudah ada BonusDetail untuk pesanan ini
        sudah_ada_bonus = BonusDetail.objects.filter(pesanan_id=instance.id).exists()
        if not sudah_ada_bonus:
            # Panggil create_sales_bonus secara aman
            try:
                viewset = BonusViewSet()
                request_mock = type('Request', (), {'session': {'user_id': instance.customer_id.user_id}})
                viewset.request = request_mock
                viewset.create_sales_bonus()
            except Exception as e:
                print(f"Gagal membuat bonus: {e}")

    elif instance.status == 'cancelled':
        # Jika status dibatalkan dan faktur ada, hapus
        if hasattr(instance, 'faktur'):
            instance.faktur.delete()
