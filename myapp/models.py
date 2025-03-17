from django.db import models
from django.db.models import Max
from datetime import timedelta

class Admin(models.Model):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Sales(models.Model):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=50)
    rute = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Customer(models.Model):
    nama = models.CharField(max_length=50)
    no_hp = models.CharField(max_length=20, unique=True)
    toko_customer = models.CharField(max_length=50)
    lokasi = models.CharField(max_length=255)
    alamat_lengkap = models.CharField(max_length=255)
    catatan = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nama

class Supplier(models.Model):
    perusahaan = models.CharField(max_length=50)
    nama_sales = models.CharField(max_length=50)
    no_hp = models.CharField(max_length=20, unique=True)
    lokasi = models.CharField(max_length=50)
    jenis_barang = models.CharField(max_length=50)
    merk = models.CharField(max_length=50)
    alamat_lengkap = models.CharField(max_length=255)
    catatan = models.TextField(null=True)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.perusahaan

class DetailBarang(models.Model):
    gambar = models.BinaryField()
    kode = models.CharField(max_length=10, unique=True)
    nama = models.CharField(max_length=50)
    kategori= models.CharField(max_length=50)
    merk = models.CharField(max_length=50)
    harga_barang = models.DecimalField(max_digits=19, decimal_places=2)
    stok_minimum = models.IntegerField()
    min_beli_grosir_1 = models.IntegerField()
    min_beli_grosir_2 = models.IntegerField()
    harga_satuan_1 = models.DecimalField(max_digits=19, decimal_places=2)
    harga_satuan_2 = models.DecimalField(max_digits=19, decimal_places=2)
    keterangan = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def db_type(self, connection):
        if connection.vendor == 'mysql':
            return 'MEDIUMBLOB'
        return super().db_type(connection)
    
    def __str__(self):
        return self.nama

class Barang(models.Model):
    detail_barang = models.ForeignKey(DetailBarang, on_delete=models.CASCADE, related_name='detail_barang', related_query_name='detail_barang')
    harga_jual = models.DecimalField(max_digits=19, decimal_places=2)
    qty_terjual = models.IntegerField()
    stok = models.IntegerField()
    qty_siap_jual = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.detail_barang.nama

class TransaksiMasuk(models.Model):
    barang = models.ForeignKey(Barang, on_delete=models.CASCADE, related_name='barang_masuk', related_query_name='barang_masuk')
    no_bukti = models.CharField(max_length=10, unique=True)
    keterangan = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti

class TransaksiKeluar(models.Model):
    barang = models.ForeignKey(Barang, on_delete=models.CASCADE, related_name='barang_keluar', related_query_name='barang_keluar')
    no_bukti = models.CharField(max_length=10, unique=True)
    keterangan = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti

class DetailInvoice(models.Model):
    no_invoice = models.CharField(max_length=50, unique=True)
    no_referensi = models.CharField(max_length=50)
    top = models.IntegerField()
    jatuh_tempo = models.DateTimeField()
    ppn = models.DecimalField(max_digits=5, decimal_places=2)
    diskon_invoice = models.DecimalField(max_digits=19, decimal_places=2)
    ongkir = models.DecimalField(max_digits=19, decimal_places=2)
    qty_pesanan = models.IntegerField()
    diskon_barang = models.DecimalField(max_digits=19, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_invoice

class ReturPembelian(models.Model):
    no_bukti = models.CharField(max_length=10, unique=True)
    qty_retur = models.IntegerField()
    total = models.DecimalField(max_digits=19, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti

class PembayaranHutang(models.Model):
    no_bukti = models.CharField(max_length=10, unique=True)
    total_invoice = models.DecimalField(max_digits=19, decimal_places=2)
    total_potongan = models.DecimalField(max_digits=19, decimal_places=2)
    total_pelunasan = models.DecimalField(max_digits=19, decimal_places=2)
    nilai_potongan = models.DecimalField(max_digits=19, decimal_places=2)
    nilai_bayar = models.DecimalField(max_digits=19, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti

class Invoice(models.Model):
    barang = models.ForeignKey(Barang, on_delete=models.CASCADE, related_name='invoice_barang', related_query_name='invoice_barang')
    detail_invoice = models.ForeignKey(DetailInvoice, on_delete=models.CASCADE, related_name='detail_invoice', related_query_name='detail_invoice')
    retur_pembelian = models.ForeignKey(ReturPembelian, on_delete=models.CASCADE, related_name='invoice_retur', related_query_name='invoice_retur')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='invoice_supplier', related_query_name='invoice_supplier')
    pembayaran_hutang = models.ForeignKey(PembayaranHutang, on_delete=models.CASCADE, related_name='invoice_hutang', related_query_name='invoice_hutang')
    total = models.DecimalField(max_digits=19, decimal_places=2)
    status = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Invoice {self.id}"

class DetailFaktur(models.Model):
    no_faktur = models.CharField(max_length=10, unique=True)
    top = models.IntegerField()
    jatuh_tempo = models.DateTimeField(null=True, blank=True)
    alamat_kirim = models.CharField(max_length=255)
    keterangan = models.TextField(null=True)
    no_referensi = models.CharField(max_length=50, unique=True)
    ppn = models.DecimalField(max_digits=5, decimal_places=2)
    diskon_faktur = models.DecimalField(max_digits=5, decimal_places=2)
    ongkir = models.DecimalField(max_digits=19, decimal_places=2)
    qty_pesanan = models.IntegerField()
    diskon_barang = models.DecimalField(max_digits=19, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_faktur
    
    def set_jatuh_tempo(self):
        if self.top and self.created_at:
            self.jatuh_tempo = self.created_at + timedelta(days=self.top)
        return self.jatuh_tempo

    def generate_no_referensi(self):
        if not self.no_faktur:  # Jika no_faktur belum diisi
         # Ambil nomor terakhir dari database
            last_faktur = DetailFaktur.objects.aggregate(Max('no_faktur'))['no_faktur__max']
            if last_faktur:
             # Ambil angka terakhir dan tambahkan 1
                last_number = int(last_faktur[2:])  # Ambil bagian angka setelah 'BM'
                new_number = last_number + 1
            else:
             # Jika belum ada faktur, mulai dari 1
                new_number = 1
         # Format nomor faktur (BM001, BM002, dst.)
            self.no_faktur = f"BM{new_number:03d}"
        return self.no_faktur
    
    def generate_no_faktur(self):
        if not self.no_referensi:
            last_ref = DetailFaktur.objects.aggregate(Max('no_referensi'))['no_referensi__max']
            if last_ref:
                last_num = int(last_ref[2:])
                new_num = last_num + 1
            else:
                new_num = 1

            self.no_referensi = f"BJ{new_num:03d}"
        return self.no_referensi

    def save(self, *args, **kwargs):
        if not self.pk:
            self.generate_no_faktur()
            self.generate_no_referensi
        self.jatuh_tempo = self.set_jatuh_tempo()
        super().save(*args, **kwargs)  # Simpan ke database

class ReturPenjualan(models.Model):
    no_bukti = models.CharField(max_length=10, unique=True)
    qty_retur = models.IntegerField()
    total = models.DecimalField(max_digits=19, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti
    
    def generate_no_bukti(self):
        last_retur = ReturPenjualan.objects.aggregate(Max('no_bukti'))['no_bukti__max']
        if last_retur:
            last_number = int(last_retur[4:])
            new_number = last_number + 1
        else:
            new_number = 1
        return f"BMRJ{new_number:03d}"

class PembayaranPiutang(models.Model):
    no_bukti = models.CharField(max_length=10, unique=True)
    total_faktur = models.DecimalField(max_digits=19, decimal_places=2)
    total_potongan = models.DecimalField(max_digits=19, decimal_places=2)
    total_pelunasan = models.DecimalField(max_digits=19, decimal_places=2)
    nilai_potongan = models.DecimalField(max_digits=19, decimal_places=2)
    nilai_bayar = models.DecimalField(max_digits=19, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti

class Faktur(models.Model):
    barang = models.ForeignKey(Barang, on_delete=models.CASCADE, related_name='faktur_barang', related_query_name='faktur_barang')
    detail_faktur = models.ForeignKey(DetailFaktur, on_delete=models.CASCADE, related_name='detail_faktur', related_query_name='detail_faktur')
    retur_penjualan = models.ForeignKey(ReturPenjualan, on_delete=models.CASCADE, related_name='faktur_retur', related_query_name='faktur_retur')
    sales = models.ForeignKey(Sales, on_delete=models.CASCADE, related_name='faktur_sales', related_query_name='faktur_sales')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='faktur_customer', related_query_name='faktur_customer')
    pembayaran_piutang = models.ForeignKey(PembayaranPiutang, on_delete=models.CASCADE, related_name='faktur_piutang', related_query_name='faktur_piutang')
    total = models.DecimalField(max_digits=19, decimal_places=2)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('ready', 'Ready'),
        ('shipped', 'Shipped')
    ]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Faktur {self.id}"
    
    def hitung_total(self):
        detail_faktur = self.detail_faktur
        barang = self.barang.detail_barang

        if detail_faktur.qty_pesanan >= barang.min_beli_grosir_2:
            harga_satuan = barang.harga_satuan_2
        elif detail_faktur.qty_pesanan >= barang.min_beli_grosir_1:
            harga_satuan = barang.harga_satuan_1
        else:
            harga_satuan = self.barang.harga_jual

        subtotal = (harga_satuan - detail_faktur.diskon_barang) * detail_faktur.qty_pesanan
        total = subtotal + detail_faktur.ppn + detail_faktur.ongkir - detail_faktur.diskon_faktur
        return total
    
    def save(self, *args, **kwargs):
        self.total = self.hitung_total()
        super().save(*args, **kwargs)

class Katalog(models.Model):
    barang = models.ForeignKey(Barang, on_delete=models.CASCADE, related_name='katalog_barang', related_query_name='katalog_barang')
    harga_diskon = models.DecimalField(max_digits=19, decimal_places=2)
    harga = models.DecimalField(max_digits=19, decimal_places=2)
    is_katalog_utama = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Katalog {self.barang.detail_barang.nama}"