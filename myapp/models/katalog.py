from django.db import models
from .barang import Barang

class Katalog(models.Model):
    id = models.AutoField(primary_key=True)
    barang = models.ManyToManyField(Barang, through="KatalogBarang")
    harga_tertera = models.DecimalField(max_digits=19, decimal_places=2)
    harga_diskon = models.DecimalField(max_digits=19, decimal_places=2)
    is_katalog_utama = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id}"
    
class KatalogBarang(models.Model):
    katalog = models.ForeignKey(Katalog, on_delete=models.CASCADE, related_name="promosi_barang")
    barang = models.ForeignKey(Barang, on_delete=models.CASCADE)
    gambar_pelengkap = models.ImageField(upload_to='images/', null=True, blank=True)