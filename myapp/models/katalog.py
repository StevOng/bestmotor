from django.db import models
from .barang import Barang

class Katalog(models.Model):
    id = models.AutoField(primary_key=True)
    barang = models.ManyToManyField(Barang)
    harga_tertera = models.DecimalField(max_digits=19, decimal_places=2)
    harga_diskon = models.DecimalField(max_digits=19, decimal_places=2)
    is_katalog_utama = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.harga_tertera}"