from django.db import models
from datetime import timedelta
from decimal import Decimal
from .barang import *
from .supplier import Supplier

class Invoice(models.Model):
    id = models.AutoField(primary_key=True)
    supplier_id = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    barang = models.ManyToManyField(Barang, through='DetailInvoice')
    no_invoice = models.CharField(max_length=50, unique=True)
    no_referensi = models.CharField(max_length=50, blank=True)
    tanggal = models.DateTimeField(auto_now_add=True)
    top = models.IntegerField()
    jatuh_tempo = models.DateTimeField(blank=True, null=True)
    bruto = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    ppn = models.DecimalField(max_digits=5, decimal_places=2)
    ongkir = models.DecimalField(max_digits=19, decimal_places=2)
    diskon_invoice = models.DecimalField(max_digits=19, decimal_places=2, default=Decimal('0.00'))
    netto = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    potongan = models.DecimalField(max_digits=19, decimal_places=2, default=Decimal('0.00'))
    sisa_bayar = models.DecimalField(max_digits=19, decimal_places=2, default=Decimal('0.00'))
    CHOICES = [
        ('lunas','Lunas'),
        ('belum_lunas','Belum Lunas'),
        ('jatuh_tempo','Jatuh Tempo')
    ]
    status = models.CharField(max_length=30, choices=CHOICES, default='belum lunas')
    terakhir_edit = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_invoice
    
    def hitung_total_bruto(self):
        total = Decimal(0)
        for detail in self.detailinvoice_set.all():
            total += detail.total_harga_barang()
        self.bruto = total
        return self.bruto
    
    def hitung_total_netto(self):
        self.netto = self.bruto + (self.bruto * self.ppn) + self.ongkir - self.diskon_invoice
        return self.netto
    
    def set_sisa_bayar(self):
        self.sisa_bayar = self.netto
        return self.sisa_bayar
    
    def set_jatuh_tempo(self):
        self.jatuh_tempo = self.tanggal + timedelta(days=self.top)
        return self.jatuh_tempo
    
    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.set_sisa_bayar()  # jika belum berarti baru maka generate
        super().save(*args, **kwargs)
    
class DetailInvoice(models.Model):
    id = models.AutoField(primary_key=True)
    invoice_id = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    barang_id = models.ForeignKey(Barang, on_delete=models.SET_NULL, null=True)
    qty_beli = models.IntegerField()
    qty_retur = models.IntegerField(default=0)
    harga_beli = models.DecimalField(max_digits=19, decimal_places=2)
    diskon_barang = models.DecimalField(max_digits=19, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id}"
    
    def total_diskon_barang(self):
        return self.qty_beli * self.diskon_barang
    
    def total_harga_barang(self):
        return (self.qty_beli * self.harga_beli) - self.total_diskon_barang()
    
    def nilai_ppn(self):
        return self.total_harga_barang() * self.invoice_id.ppn

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        barang = Barang.objects.get(id=self.barang_id)
        if barang:
            barang.update_modal(self.qty_beli, self.harga_beli, self.diskon_barang if self.diskon_barang else 0)