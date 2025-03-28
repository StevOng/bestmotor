from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.barang.urls import router as barang_router
from .views.customer.urls import router as customer_router
from .views.distribusi.urls import router as distribusi_router
from .views.faktur.urls import router as faktur_router
from .views.hutang.urls import router as hutang_router
from .views.invoice.urls import router as invoice_router
from .views.katalog.urls import router as katalog_router
from .views.pesanan.urls import router as pesanan_router
from .views.piutang.urls import router as piutang_router
from .views.retur.urls import router as retur_router
from .views.supplier.urls import router as supplier_router
from .views.user.urls import router as user_router

router = DefaultRouter()
router.registry.extend(barang_router.registry) # menggabungkan semua endpoint kedalam satu router
router.registry.extend(customer_router.registry)
router.registry.extend(distribusi_router.registry)
router.registry.extend(faktur_router.registry)
router.registry.extend(hutang_router.registry)
router.registry.extend(invoice_router.registry)
router.registry.extend(katalog_router.registry)
router.registry.extend(pesanan_router.registry)
router.registry.extend(piutang_router.registry)
router.registry.extend(retur_router.registry)
router.registry.extend(supplier_router.registry)
router.registry.extend(user_router.registry)

urlpatterns = [
    path('', include(router.urls))
]