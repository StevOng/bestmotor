from django.db import models

class Barang(models.Model):
    id = models.AutoField(primary_key=True)
    kode_barang = models.CharField(max_length=10, unique=True)
    nama_barang = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.kode_barang
    
class DetailBarang(models.Model):
    id = models.AutoField(primary_key=True)
    barang_id = models.ForeignKey(Barang, on_delete=models.CASCADE)
    CHOICES = [
        ('aki','Aki'),
        ('filter udara','Filter Udara'),
        ('kampas rem','Kampas Rem'),
        ('oli dan pelumas','Oli dan Pelumas'),
        ('karet dan seal','Karet dan Seal'),
        ('busi dan tutup busi','Busi dan Tutup Busi'),
        ('piston dan ring piston','Piston dan Ring Piston'),
        ('karburator dan vacuum', 'Karburator dan Vacuum'),
        ('camshaft','Camshaft'),
        ('crankshaft','Crankshaft'),
        ('katup','Katup'),
        ('connecting rod','Connecting Rod'),
        ('pompa oli','Pompa Oli'),
        ('lampu','Lampu'),
        ('ban','Ban'),
        ('velg','Velg'),
        ('rem','Rem'),
        ('spion','Spion')
    ]
    kategori = models.CharField(max_length=50, choices=CHOICES, default=None)
    MERK = [
        ('toyota', 'Toyota'),
        ('astra', 'Astra'),
        ('denso', 'Denso'),
        ('honda', 'Honda'),
        ('yamaha', 'Yamaha'),
        ('ngk', 'NGK'),
        ('daytona', 'Daytona'),
        ('aspira', 'Aspira'),
        ('bosch', 'Bosch'),
        ('isuzu', 'Isuzu')
    ]
    merk = models.CharField(max_length=50, choices=MERK, default=None)
    harga_jual = models.DecimalField(max_digits=19, decimal_places=2)
    stok_minimum = models.IntegerField()
    min_qty_grosir1 = models.IntegerField()
    min_qty_grosir2 = models.IntegerField()
    harga_satuan1 = models.DecimalField(max_digits=19, decimal_places=2)
    harga_satuan2 = models.DecimalField(max_digits=19, decimal_places=2)
    stok = models.IntegerField()
    qty_terjual = models.IntegerField()
    gambar = models.BinaryField()
    keterangan = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def db_type(self, connection):
        if connection.vendor == 'mysql':
            return 'MEDIUMBLOB'
        return super().db_type(connection)

    def __str__(self):
        return f'{self.barang_id.nama_barang}, stok: {self.stok}'
    
    def get_harga_berdasarkan_qty(self, qty):
        if qty >= self.min_qty_grosir2:
            self.harga_jual = self.harga_satuan2
            return self.harga_jual
        elif qty >= self.min_qty_grosir1:
            self.harga_jual = self.harga_satuan1
            return self.harga_satuan1
        else:
            return self.harga_jual
