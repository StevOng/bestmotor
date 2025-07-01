from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from ...models.faktur import Faktur
from .serializer import FakturSerializer

class FakturViewSet(viewsets.ModelViewSet):
    queryset = Faktur.objects.all()
    serializer_class = FakturSerializer

    @action(detail=False, methods=['get'], url_path='by_sales/(?P<user_id>[^/.]+)')
    def by_sales(self, request, user_id=None):
        role = request.session.get("role")

        if role == "admin":
            faktur = Faktur.objects.filter(
                status__in=["belum_lunas", "jatuh_tempo"]
            ).select_related("pesanan_id__customer_id")
        else:
            # Ambil faktur dengan status belum_lunas/jatuh_tempo & pesanan dari sales/user_id tersebut
            faktur = Faktur.objects.filter(
                status__in=['belum_lunas', 'jatuh_tempo'],
                pesanan_id__customer_id__user_id=user_id
            ).select_related('pesanan_id__customer_id')
        data = [
            {
                "id": f.id,
                "no_faktur": f.no_faktur,
                "tanggal_faktur": f.tanggal_faktur,
                "no_referensi": f.pesanan_id.no_referensi,
                "customer": f.pesanan_id.customer_id.nama,
                "customer_id": f.pesanan_id.customer_id.id,
                "total": float(f.total),
                "sisa_bayar": float(f.sisa_bayar),
            }
            for f in faktur
        ]
        return Response(data)