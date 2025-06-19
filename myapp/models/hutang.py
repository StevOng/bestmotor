from django.db import models
from django.db.models import Sum, F
from .supplier import Supplier
from .invoice import *

class Hutang(models.Model):
    id = models.AutoField(primary_key=True)
    supplier_id = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    invoice = models.ManyToManyField(Invoice, through="HutangInvoice")
    no_bukti = models.CharField(max_length=10, unique=True)
    tanggal = models.DateTimeField(auto_now_add=True)
    total_potongan = models.DecimalField(max_digits=19, decimal_places=2, default=Decimal('0.00'))
    total_pelunasan = models.DecimalField(max_digits=19, decimal_places=2, default=Decimal('0.00'))
    update_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti
    
    def generate_no_bukti(self):
        if not self.no_bukti:
            last_bukti = Hutang.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_bukti:
                last_num = int(last_bukti.no_bukti[2:]) # mengambil angka stelah 2 karakter PH
                self.no_bukti = f"PH{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_bukti = "PH0001" # kode pertama
        return self.no_bukti
    
    def potongan_total(self):
        total_potongan = self.invoice_set.aggregate(
            potongan=Sum('potongan')
        )['potongan'] or 0
        return total_potongan or 0
    
    def pelunasan_total(self):
        total_pelunasan = self.invoice_set.aggregate(
            pelunasan=Sum(F('netto')-F('sisa_bayar'))
        )['pelunasan']
        return total_pelunasan or 0
    
    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.generate_no_bukti() # jika belum berarti baru maka generate
        self.potongan_total()
        self.pelunasan_total()
        super().save(*args, **kwargs)

class HutangInvoice(models.Model):
    hutang = models.ForeignKey(Hutang, on_delete=models.CASCADE)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    nilai_bayar = models.DecimalField(max_digits=19, decimal_places=2)