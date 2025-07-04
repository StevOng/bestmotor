from django.db import models
from datetime import timedelta
from decimal import Decimal
from .customer import Customer
from .barang import Barang

class Pesanan(models.Model):
    id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(Customer, on_delete=models.CASCADE)
    barang = models.ManyToManyField(Barang, through='DetailPesanan')
    no_pesanan = models.CharField(max_length=20, unique=True)
    no_referensi = models.CharField(max_length=50, blank=True)
    bruto = models.DecimalField(max_digits=10, decimal_places=0, default=Decimal('0.00'))
    ppn = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    ongkir = models.DecimalField(max_digits=19, decimal_places=0, default=Decimal('0.00'))
    diskon_pesanan = models.DecimalField(max_digits=19, decimal_places=0, default=Decimal('0.00'))
    netto = models.DecimalField(max_digits=10, decimal_places=0, default=Decimal('0.00'))
    KURIR = [
        ('staff','Staff'),
        ('penangkutan','Pengangkutan'),
    ]
    kurir = models.CharField(max_length=255, choices=KURIR, default=None)
    top = models.IntegerField(default=0)
    jatuh_tempo = models.DateTimeField(blank=True, null=True)
    alamat_kirim = models.CharField(max_length=255, null=True, blank=True)
    keterangan = models.TextField(null=True, blank=True)
    CHOICES = [
        ('pending','Pending'),
        ('ready','Ready'),
        ('shipped','Shipped'),
        ('cancelled', 'Cancelled')
    ]
    status = models.CharField(max_length=30, choices=CHOICES, default='pending')
    tanggal_pesanan = models.DateTimeField(auto_now_add=True)
    terakhir_edit = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id}"
    
    def generate_no_pesanan(self):
        if not self.no_pesanan:
            last_pesan = Pesanan.objects.order_by("-id").first() # berdasarkan id terbesar
            if last_pesan:
                last_num = int(last_pesan.no_pesanan[2:]) # mengambil angka stelah 2 karakter BM
                self.no_pesanan = f"BM{last_num+1:04d}" # tambah 1 ke angka 4 digit terakhir
            else:
                self.no_pesanan = "BM0001" # kode pertama
        return self.no_pesanan
    
    def hitung_total_bruto(self):
        total = Decimal(0)
        for detail in self.detailpesanan_set.all():
            total += detail.total_harga_barang()
        self.bruto = total
        return self.bruto

    def hitung_total_netto(self):
        self.netto = self.bruto + (self.bruto * (self.ppn / Decimal('100'))) + self.ongkir - self.diskon_pesanan
        return self.netto
    
    def set_jatuh_tempo(self):
        self.jatuh_tempo = self.tanggal_pesanan + timedelta(days=self.top)
        return self.jatuh_tempo

    def save(self, *args, **kwargs):
        if not self.pk:# cek jika id sudah ada atau belum
            self.generate_no_pesanan() # jika belum maka generate
        super().save(*args, **kwargs)

class DetailPesanan(models.Model):
    id = models.AutoField(primary_key=True)
    pesanan_id = models.ForeignKey(Pesanan, on_delete=models.CASCADE)
    barang_id = models.ForeignKey(Barang, on_delete=models.CASCADE)
    qty_pesan = models.IntegerField()
    qty_retur = models.IntegerField(default=0, null=True, blank=True)
    diskon_barang = models.DecimalField(max_digits=19, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id}"
    
    def total_diskon_barang(self):
        harga = self.barang_id.get_harga_berdasarkan_qty(self.qty_pesan)
        return harga *  self.qty_pesan * (self.diskon_barang / Decimal('100'))
    
    def total_harga_barang(self):
        harga = self.barang_id.get_harga_berdasarkan_qty(self.qty_pesan)
        total_diskon = self.total_diskon_barang()
        return (harga * self.qty_pesan) - total_diskon
    
    def nilai_ppn(self):
        return self.total_harga_barang() * (self.pesanan_id.ppn / Decimal('100'))

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.barang_id:
            self.barang_id.update_qty_terjual(self.qty_pesan)