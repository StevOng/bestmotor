from django.db import models
from .pesanan import Pesanan

class Faktur(models.Model):
    id = models.AutoField(primary_key=True)
    pesanan_id = models.OneToOneField(Pesanan, on_delete=models.CASCADE)
    no_faktur = models.CharField(max_length=50, unique=True)
    sisa_bayar = models.DecimalField(max_digits=19, decimal_places=0)
    tanggal_faktur = models.DateTimeField(auto_now_add=True)
    potongan = models.DecimalField(max_digits=19, decimal_places=0, null=True, blank=True)
    total = models.DecimalField(max_digits=19, decimal_places=0)
    CHOICES = [
        ('belum_lunas','Belum Lunas'),
        ('jatuh_tempo', 'Jatuh Tempo'),
        ('lunas','Lunas')
    ]
    status = models.CharField(max_length=30, choices=CHOICES, default='belum_lunas')
    terakhir_edit = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_faktur
    
    def generate_no_faktur(self):
        if not self.no_faktur:
            last_bukti = Faktur.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_bukti:
                last_num = int(last_bukti.no_bukti[3:]) # mengambil angka stelah 3 karakter BJ2
                self.no_faktur = f"BJ2{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_faktur = "BJ20001" # kode pertama
        return self.no_faktur
    
    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.generate_no_faktur() # jika belum berarti baru maka generate
        super().save(*args, **kwargs)