from django.db import models
from ..views.barang.merk_choices import MERK
from ..views.barang.tipe_choices import TIPE

class Barang(models.Model):
    id = models.AutoField(primary_key=True)
    kode_barang = models.CharField(max_length=10, unique=True)
    nama_barang = models.CharField(max_length=255)
    tipe = models.CharField(max_length=50, choices=TIPE, default=None)
    merk = models.CharField(max_length=50, choices=MERK, default=None)
    harga_jual = models.DecimalField(max_digits=19, decimal_places=2)
    stok_minimum = models.IntegerField()
    harga_modal = models.DecimalField(max_digits=19, decimal_places=2, default=0)
    stok = models.IntegerField(default=0)
    qty_terjual = models.IntegerField(default=0)
    gambar = models.ImageField(upload_to='images/',null=True, blank=True)
    keterangan = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.kode_barang
        
    def update_modal(self, qty_baru, harga_baru, diskon):
        total_stok_lama = self.stok
        total_harga_lama = self.harga_modal * total_stok_lama

        total_stok_baru = qty_baru
        total_harga_baru = (harga_baru * qty_baru) - diskon

        total_unit = total_stok_lama + total_stok_baru
        if total_unit == 0:
            return
        
        harga_modal_baru = (total_harga_lama + total_harga_baru) / total_unit
        self.harga_modal = harga_modal_baru
        self.stok = total_unit
        self.save()

    def update_qty_terjual(self, qty_terjual_baru):
        total_qty_terjual_lama = self.qty_terjual
        total_qty_terjual_baru = qty_terjual_baru

        total_unit = total_qty_terjual_lama + total_qty_terjual_baru
        if total_unit == 0:
            return
        
        self.qty_terjual = total_unit
        self.save()
    
    def get_harga_berdasarkan_qty(self, qty):
        tier = self.tierharga_set.filter(min_qty_grosir__lte=qty).order_by('-min_qty_grosir').first()
        if tier:
            return tier.harga_satuan
        return self.harga_jual
    
class TierHarga(models.Model):
    id = models.AutoField(primary_key=True)
    barang_id = models.ForeignKey(Barang, on_delete=models.CASCADE)
    min_qty_grosir = models.IntegerField()
    harga_satuan = models.DecimalField(max_digits=19, decimal_places=2)

    def __str__(self):
        return f"{self.barang_id.kode_barang} - Min Qty: {self.min_qty_grosir} - Harga: {self.harga_satuan}"