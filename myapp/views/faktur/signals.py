from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from ...models.faktur import Faktur

@receiver(m2m_changed, sender=Faktur.piutang.through)
def update_status(sender, instance, action, **kwargs):
    if action in ['post_add', 'post_remove', 'post_clear']:
        instance.update_status()
        instance.save()