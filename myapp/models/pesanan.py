from django.db import models
from datetime import timedelta
from customer import Customer
from barang import Barang

class Pesanan(models.Model):
    id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(Customer, on_delete=models.CASCADE)
    barang = models.ManyToManyField(Barang, through='DetailPesanan')
    no_pesanan = models.CharField(max_length=20, unique=True)
    no_referensi = models.CharField(max_length=50)
    total = models.DecimalField(max_digits=19, decimal_places=2)
    CHOICES = [
        ('pending','Pending'),
        ('ready','Ready'),
        ('shipped','Shipped')
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

    def save(self, *args, **kwargs):
        if not self.pk: # cek jika belum ada primary key yaitu id sudah ada atau belum
            self.generate_no_pesanan() # jika belum berarti baru maka generate
            self.generate_no_referensi()
        super().save(*args, **kwargs)

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
    bruto = models.DecimalField(max_digits=10, decimal_places=2)
    ppn = models.DecimalField(max_digits=5, decimal_places=2)
    ongkir = models.DecimalField(max_digits=19, decimal_places=2)
    diskon_pesanan = models.DecimalField(max_digits=19, decimal_places=2)
    netto = models.DecimalField(max_digits=10, decimal_places=2)
    qty_pesan = models.IntegerField()
    diskon_barang = models.DecimalField(max_digits=19, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id}"
    
    def set_jatuh_tempo(self):
        self.jatuh_tempo = self.tanggal_pesanan + timedelta(days=self.top)
        return self.jatuh_tempo

    def save(self, *args, **kwargs):
        if not self.jatuh_tempo: # periksa jatuh tempo sudah/belum diatur
            self.set_jatuh_tempo()
        super().save(*args, **kwargs)