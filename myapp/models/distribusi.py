from django.db import models
from barang import Barang

class TransaksiMasuk(models.Model):
    id = models.AutoField(primary_key=True)
    barang = models.ManyToManyField(Barang)
    no_bukti = models.CharField(max_length=10, unique=True)
    keterangan = models.TextField(null=True, blank=True)
    qty_masuk = models.IntegerField()
    tanggal_pembuatan = models.DateTimeField(auto_now_add=True)
    terakhir_edit = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti
    
    def generate_no_bukti(self):
        if not self.no_bukti:
            last_bukti = TransaksiMasuk.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_bukti:
                last_num = int(last_bukti.no_bukti[3:]) # mengambil angka stelah 3 karakter TMB
                self.no_bukti = f"TMB{last_num+1:03d}" # tambah 1 ke angka 3 digit terakhir
            else:
                self.no_bukti = "TMB001" # kode pertama
        return self.no_bukti
    
    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.generate_no_bukti() # jika belum berarti baru maka generate
        super().save(*args, **kwargs)

class TransaksiKeluar(models.Model):
    id = models.AutoField(primary_key=True)
    barang = models.ManyToManyField(Barang)
    no_bukti = models.CharField(max_length=10, unique=True)
    keterangan = models.TextField(null=True, blank=True)
    qty_masuk = models.IntegerField()
    tanggal_pembuatan = models.DateTimeField(auto_now_add=True)
    terakhir_edit = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti
    
    def generate_no_bukti(self):
        if not self.no_bukti:
            last_bukti = TransaksiKeluar.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_bukti:
                last_num = int(last_bukti.no_bukti[3:]) # mengambil angka stelah 3 karakter TKB
                self.no_bukti = f"TKB{last_num+1:03d}" # tambah 1 ke angka 3 digit terakhir
            else:
                self.no_bukti = "TKB001" # kode pertama
        return self.no_bukti
    
    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.generate_no_bukti() # jika belum berarti baru maka generate
        super().save(*args, **kwargs)