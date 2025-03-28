from django.db import models
from .invoice import Invoice
from .barang import Barang
from .faktur import Faktur

class ReturBeli(models.Model):
    id = models.AutoField(primary_key=True)
    invoice_id = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True)
    barang = models.ManyToManyField(Barang)
    no_bukti = models.CharField(max_length=10, unique=True)
    tanggal = models.DateTimeField(auto_now_add=True)
    terakhir_edit = models.DateTimeField(auto_now=True)
    qty_retur = models.IntegerField()
    subtotal = models.DecimalField(max_digits=19, decimal_places=2)

    def __str__(self):
        return self.no_bukti
    
    def generate_no_bukti(self):
        if not self.no_bukti:
            last_bukti = ReturBeli.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_bukti:
                last_num = int(last_bukti.no_bukti[3:]) # mengambil angka stelah 3 karakter RTB
                self.no_bukti = f"RTB{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_bukti = "RTB0001" # kode pertama
        return self.no_bukti
    
    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.generate_no_bukti() # jika belum berarti baru maka generate
        super().save(*args, **kwargs)

class ReturJual(models.Model):
    id = models.AutoField(primary_key=True)
    faktur_id = models.ForeignKey(Faktur, on_delete=models.SET_NULL, null=True)
    barang = models.ManyToManyField(Barang)
    no_bukti = models.CharField(max_length=10, unique=True)
    tanggal = models.DateTimeField(auto_now_add=True)
    terakhir_edit = models.DateTimeField(auto_now=True)
    qty_retur = models.IntegerField()
    subtotal = models.DecimalField(max_digits=19, decimal_places=2)

    def __str__(self):
        return self.no_bukti
    
    def generate_no_bukti(self):
        if not self.no_bukti:
            last_bukti = ReturJual.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_bukti:
                last_num = int(last_bukti.no_bukti[3:]) # mengambil angka stelah 3 karakter RTJ
                self.no_bukti = f"RTJ{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_bukti = "RTJ0001" # kode pertama
        return self.no_bukti
    
    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.generate_no_bukti() # jika belum berarti baru maka generate
        super().save(*args, **kwargs)
