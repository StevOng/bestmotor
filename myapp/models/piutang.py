from django.db import models
from django.db.models import Sum, F
from decimal import Decimal
from .customer import Customer
from .faktur import Faktur

class Piutang(models.Model):
    id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(Customer, on_delete=models.PROTECT)
    faktur = models.ManyToManyField(Faktur, through="PiutangFaktur")
    no_bukti = models.CharField(max_length=10, unique=True)
    tanggal = models.DateTimeField(auto_now_add=True)
    total_potongan = models.DecimalField(max_digits=19, decimal_places=0, default=Decimal('0'))
    total_pelunasan = models.DecimalField(max_digits=19, decimal_places=0, default=Decimal('0'))
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti
    
    def generate_no_bukti(self):
        if not self.no_bukti:
            last_bukti = Piutang.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_bukti:
                last_num = int(last_bukti.no_bukti[2:]) # mengambil angka stelah 2 karakter PP
                self.no_bukti = f"PP{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_bukti = "PP0001" # kode pertama
        return self.no_bukti

    def potongan_total(self):
        return (
            self.faktur
                .aggregate(pot=Sum('potongan'))  # Sum field potongan di Faktur
                .get('pot') or 0
        )

    def pelunasan_total(self):
        return (
            self.faktur
                .aggregate(pay=Sum(F('total') - F('sisa_bayar')))
                .get('pay') or 0
        )
    
    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.generate_no_bukti() # jika belum berarti baru maka generate
        super().save(*args, **kwargs)

class PiutangFaktur(models.Model):
    piutang = models.ForeignKey(Piutang, on_delete=models.CASCADE)
    faktur = models.ForeignKey(Faktur, on_delete=models.CASCADE)
    nilai_bayar = models.DecimalField(max_digits=19, decimal_places=0)