from django.contrib import admin
from .models.barang import *
from .models.customer import *
from .models.distribusi import *
from .models.faktur import *
from .models.hutang import *
from .models.invoice import *
from .models.katalog import *
from .models.pesanan import *
from .models.piutang import *
from .models.retur import *
from .models.supplier import *
from .models.user import *

# Register your models here.
admin.site.register(Barang)
admin.site.register(TierHarga)
admin.site.register(User)
admin.site.register(Customer)
admin.site.register(TransaksiMasuk)
admin.site.register(TransaksiMasukBarang)
admin.site.register(TransaksiKeluar)
admin.site.register(TransaksiKeluarBarang)
admin.site.register(Pesanan)
admin.site.register(DetailPesanan)
admin.site.register(Faktur)
admin.site.register(Supplier)
admin.site.register(Hutang)
admin.site.register(HutangInvoice)
admin.site.register(Invoice)
admin.site.register(DetailInvoice)
admin.site.register(Katalog)
admin.site.register(Piutang)
admin.site.register(PiutangFaktur)
admin.site.register(ReturBeli)
admin.site.register(ReturBeliBarang)
admin.site.register(ReturJual)
admin.site.register(ReturJualBarang)