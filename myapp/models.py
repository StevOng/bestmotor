from django.db import models

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
    jatuh_tempo = models.DateTimeField()
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

class ReturPenjualan(models.Model):
    no_bukti = models.CharField(max_length=10, unique=True)
    qty_retur = models.IntegerField()
    total = models.DecimalField(max_digits=19, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_bukti

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
    status = models.CharField(max_length=30)
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