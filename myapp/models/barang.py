from django.db import models

class Barang(models.Model):
    id = models.AutoField(primary_key=True)
    kode_barang = models.CharField(max_length=10, unique=True)
    nama_barang = models.CharField(max_length=255)
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
    harga_modal = models.DecimalField(max_digits=19, decimal_places=2)
    stok = models.IntegerField()
    qty_terjual = models.IntegerField()
    gambar = models.BinaryField()
    keterangan = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.kode_barang

    def db_type(self, connection):
        if connection.vendor == 'mysql':
            return 'MEDIUMBLOB'
        return super().db_type(connection)
        
    def update_modal(self, qty_baru, harga_baru, diskon):
        total_stok_lama = self.stok
        total_harga_lama = self.harga_modal * total_stok_lama

        total_stok_baru = qty_baru
        total_harga_baru = (harga_baru * qty_baru) - diskon

        total_unit = total_stok_lama + total_stok_baru
        if total_unit == 0:
            return
        
        harga_modal_baru = (total_harga_lama + total_harga_baru) / total_unit
        self.harga_modal = harga_modal_baru
        self.stok = total_unit
        self.save()

    def update_qty_terjual(self, qty_terjual_baru):
        total_qty_terjual_lama = self.qty_terjual
        total_qty_terjual_baru = qty_terjual_baru

        total_unit = total_qty_terjual_lama + total_qty_terjual_baru
        if total_unit == 0:
            return
        
        self.qty_terjual = total_unit
        self.save()
    
    def get_harga_berdasarkan_qty(self, qty):
        tier = self.tierharga_set.filter(min_qty_grosir__lte=qty).order_by('-min_qty_grosir').first()
        if tier:
            return tier.harga_satuan
        return self.harga_jual
    
class TierHarga(models.Model):
    id = models.AutoField(primary_key=True)
    barang_id = models.ForeignKey(Barang, on_delete=models.CASCADE)
    min_qty_grosir = models.IntegerField()
    harga_satuan = models.DecimalField(max_digits=19, decimal_places=2)

    def __str__(self):
        return f"{self.barang_id.kode_barang} - Min Qty: {self.min_qty_grosir} - Harga: {self.harga_satuan}"