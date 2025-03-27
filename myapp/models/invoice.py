from django.db import models
from datetime import timedelta
from hutang import Hutang
from barang import Barang

class Invoice(models.Model):
    id = models.AutoField(primary_key=True)
    hutang = models.ManyToManyField(Hutang)
    barang = models.ManyToManyField(Barang, through='DetailInvoice')
    no_invoice = models.CharField(max_length=50, unique=True)
    no_referensi = models.CharField(max_length=50)
    sisa_bayar = models.DecimalField(max_digits=19, decimal_places=2)
    total = models.DecimalField(max_digits=19, decimal_places=2)
    CHOICES = [
        ('lunas','Lunas'),
        ('belum lunas','Belum Lunas'),
        ('jatuh tempo','Jatuh Tempo')
    ]
    status = models.CharField(max_length=30, choices=CHOICES, default='belum lunas')
    terakhir_edit = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.no_invoice
    
    def generate_no_invoice(self):
        if not self.no_invoice:
            last_inv = Invoice.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_inv:
                last_num = int(last_inv.no_invoice[2:]) # mengambil angka stelah 2 karakter PB
                self.no_invoice = f"PB{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_invoice = "PB0001" # kode pertama
        return self.no_invoice
    
    def generate_no_referensi(self):
        if not self.no_referensi:
            last_ref = Invoice.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_ref:
                last_num = int(last_ref.no_referensi[5:]) # mengambil angka stelah 5 karakter REFPB
                self.no_referensi = f"REFPB{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_referensi = "REFPB0001" # kode pertama
        return self.no_referensi
    
    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.generate_no_invoice() # jika belum berarti baru maka generate
            self.generate_no_referensi()
        super().save(*args, **kwargs)
    
class DetailInvoice(models.Model):
    id = models.AutoField(primary_key=True)
    invoice_id = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    barang_id = models.ForeignKey(Barang, on_delete=models.SET_NULL, null=True)
    tanggal = models.DateTimeField(auto_now_add=True)
    top = models.IntegerField()
    jatuh_tempo = models.DateTimeField()
    bruto = models.DecimalField(max_digits=10, decimal_places=2)
    ppn = models.DecimalField(max_digits=5, decimal_places=2)
    ongkir = models.DecimalField(max_digits=19, decimal_places=2)
    diskon_invoice = models.DecimalField(max_digits=19, decimal_places=2)
    netto = models.DecimalField(max_digits=10, decimal_places=2)
    qty_beli = models.IntegerField()
    harga_beli = models.DecimalField(max_digits=19, decimal_places=2)
    diskon_barang = models.DecimalField(max_digits=19, decimal_places=2)
    subtotal = models.DecimalField(max_digits=19, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id}"
    
    def set_jatuh_tempo(self):
        self.jatuh_tempo = self.tanggal + timedelta(days=self.top)
        return self.jatuh_tempo

    def save(self, *args, **kwargs):
        if not self.jatuh_tempo: # periksa jatuh tempo sudah/belum diatur
            self.set_jatuh_tempo()
        super().save(*args, **kwargs)