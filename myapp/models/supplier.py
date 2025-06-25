from django.db import models

class Supplier(models.Model):
    id = models.AutoField(primary_key=True)
    perusahaan = models.CharField(max_length=50)
    nama_sales = models.CharField(max_length=50)
    no_hp = models.CharField(max_length=20, unique=True)
    lokasi = models.CharField(max_length=50)
    jenis_barang = models.CharField(max_length=50)
    merk_barang = models.CharField(max_length=50)
    CHOICES = [
        ('aktif', 'Aktif'),
        ('tidak aktif', 'Tidak Aktif')
    ]
    status = models.CharField(max_length=30, choices=CHOICES, default='aktif')
    alamat_lengkap = models.CharField(max_length=255)
    catatan = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id}"