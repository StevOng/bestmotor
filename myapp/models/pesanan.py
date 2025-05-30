from django.db import models
from datetime import timedelta
from decimal import Decimal
from .customer import Customer
from .barang import Barang
from .faktur import Faktur

class Pesanan(models.Model):
    id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(Customer, on_delete=models.CASCADE)
    barang = models.ManyToManyField(Barang, through='DetailPesanan')
    no_pesanan = models.CharField(max_length=20, unique=True)
    no_referensi = models.CharField(max_length=50)
    bruto = models.DecimalField(max_digits=10, decimal_places=2)
    ppn = models.DecimalField(max_digits=5, decimal_places=2)
    ongkir = models.DecimalField(max_digits=19, decimal_places=2)
    diskon_pesanan = models.DecimalField(max_digits=19, decimal_places=2)
    netto = models.DecimalField(max_digits=10, decimal_places=2)
    CHOICES = [
        ('pending','Pending'),
        ('ready','Ready'),
        ('shipped','Shipped'),
        ('cancelled', 'Cancelled')
    ]
    status = models.CharField(max_length=30, choices=CHOICES, default='pending')
    terakhir_edit = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.no_pesanan
    
    def generate_no_pesanan(self):
        if not self.no_pesanan:
            last_pesan = Pesanan.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_pesan:
                last_num = int(last_pesan.no_pesanan[2:]) # mengambil angka stelah 2 karakter BM
                self.no_pesanan = f"BM{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_pesanan = "BM0001" # kode pertama
        return self.no_pesanan
    
    def generate_no_referensi(self):
        if not self.no_referensi:
            last_pesan = Pesanan.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_pesan:
                last_num = int(last_pesan.no_referensi[5:]) # mengambil angka stelah 5 karakter REFBM
                self.no_referensi = f"REFBM{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_referensi = "REFBM0001" # kode pertama
        return self.no_referensi
    
    def hitung_total_bruto(self):
        total = Decimal(0)
        for detail in self.detailpesanan_set.all():
            total += detail.total_harga_barang()
        self.bruto = total
        return self.bruto

    def hitung_total_netto(self):
        self.netto = self.bruto + (self.bruto * self.ppn) + self.ongkir - self.diskon_pesanan
        return self.netto

    def save(self, *args, **kwargs):
        if not self.pk:# cek jika id sudah ada atau belum
            self.generate_no_pesanan() # jika belum maka generate
            self.generate_no_referensi()
        self.hitung_total_bruto()
        self.hitung_total_netto()
        super().save(*args, **kwargs)

        if self.status == 'shipped':
            if not hasattr(self, 'faktur'):
                Faktur.objects.create(
                    pesanan_id = self.id,
                    sisa_bayar = self.netto,
                    total = self.netto
                )

        elif self.status == 'cancelled':
            if hasattr(self, 'faktur'):
                self.faktur.delete()

class DetailPesanan(models.Model):
    id = models.AutoField(primary_key=True)
    pesanan_id = models.ForeignKey(Pesanan, on_delete=models.CASCADE)
    barang_id = models.ForeignKey(Barang, on_delete=models.SET_NULL, null=True)
    tanggal_pesanan = models.DateTimeField(auto_now_add=True)
    CHOICES = [
        ('jne','JNE'),
        ('tiki','TIKI'),
        ('j&t','J&T'),
        ('pos indonesia','Pos Indonesia')
    ]
    kurir = models.CharField(max_length=255, choices=CHOICES, default=None)
    top = models.IntegerField()
    jatuh_tempo = models.DateTimeField()
    alamat_kirim = models.CharField(max_length=255)
    keterangan = models.TextField(null=True, blank=True)
    qty_pesan = models.IntegerField()
    qty_retur = models.IntegerField()
    diskon_barang = models.DecimalField(max_digits=19, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id}"
    
    def total_diskon_barang(self):
        return self.qty_pesan * self.diskon_barang
    
    def total_harga_barang(self):
        harga = self.barang_id.get_harga_berdasarkan_qty(self.qty_pesan)
        return (harga - self.total_diskon_barang()) * self.qty_pesan
    
    def nilai_ppn(self):
        return self.total_harga_barang() * self.pesanan_id.ppn

    def set_jatuh_tempo(self):
        self.jatuh_tempo = self.tanggal_pesanan + timedelta(days=self.top)
        return self.jatuh_tempo

    def save(self, *args, **kwargs):
        if not self.jatuh_tempo: # periksa jatuh tempo sudah/belum diatur
            self.set_jatuh_tempo()
        super().save(*args, **kwargs)

        barang = Barang.objects.get(barang_id=self.barang_id)
        if barang:
            barang.update_qty_terjual(self.qty_pesan)