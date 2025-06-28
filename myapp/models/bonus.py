from django.db import models
from .barang import Barang
from .user import User
from .pesanan import *
from decimal import Decimal

class PersenBonus(models.Model):
    id = models.AutoField(primary_key=True)
    barang_id = models.ForeignKey(Barang, on_delete=models.CASCADE)
    merk_nama = models.CharField(max_length=20)
    persenan = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, default=Decimal('0'))

class Bonus(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    total_bonus = models.DecimalField(max_digits=9, decimal_places=0, null=True, blank=True)
    tanggal_cair = models.DateTimeField(null=True, blank=True)

class BonusDetail(models.Model):
    id = models.AutoField(primary_key=True)
    bonus_id = models.ForeignKey(Bonus, on_delete=models.CASCADE)
    persen_bonus = models.ForeignKey(PersenBonus, on_delete=models.SET_NULL, null=True, blank=True)
    pesanan_id = models.ForeignKey(Pesanan, on_delete=models.CASCADE)
    detail_pesanan_id = models.ForeignKey(DetailPesanan, on_delete=models.CASCADE)
    merk = models.CharField(max_length=20)
    nama_barang = models.CharField(max_length=20)
    qty = models.IntegerField()
    harga = models.DecimalField(max_digits=9, decimal_places=0)
    nilai_bonus = models.DecimalField(max_digits=9, decimal_places=0, null=True, blank=True)
