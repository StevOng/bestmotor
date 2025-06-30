from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from ...models.retur import *
from .serializer import *

class ReturBeliViewSet(viewsets.ModelViewSet):
    queryset = ReturBeli.objects.all()
    serializer_class = ReturBeliSerializer
        
    def list(self, request):
        inv_id = request.GET.get('invId')
        if inv_id:
            try:
                invoice = Invoice.objects.get(id=inv_id)
            except Invoice.DoesNotExist:
                return Response([], status=404)

            detail_qs = invoice.detailinvoice_set.select_related('barang_id')

            data = []
            for d in detail_qs:
                b = d.barang_id
                data.append({
                    "id": b.id,
                    "kode_barang": b.kode_barang,
                    "nama_barang": b.nama_barang,
                    "harga_jual": b.harga_jual,
                    "qty": d.qty_beli,
                    "diskon": d.diskon_barang,
                    "total_diskon_barang": d.total_diskon_barang(),
                    "total_harga_barang": d.total_harga_barang()
                })

            return Response(data)

        # default jika tidak ada invId → tetap pakai bawaan ModelViewSet
        return super().list(request)

class ReturBeliBarangViewSet(viewsets.ModelViewSet):
    queryset = ReturBeliBarang.objects.all()
    serializer_class = ReturBeliBarangSerializer

class ReturJualViewSet(viewsets.ModelViewSet):
    queryset = ReturJual.objects.all()
    serializer_class = ReturJualSerializer

    @action(detail=False, methods=['get'], url_path='barang-dari-faktur')
    def get_barang_dari_faktur(self, request):
        faktur_id = request.query_params.get('fakturId')
        if not faktur_id:
            return Response({"error": "fakturId harus diisi"}, status=400)

        try:
            faktur = Faktur.objects.select_related("pesanan_id").get(id=faktur_id)
            detail_list = DetailPesanan.objects.filter(pesanan_id=faktur.pesanan_id).select_related("barang_id")
        except Faktur.DoesNotExist:
            return Response({"error": "Faktur tidak ditemukan"}, status=404)

        data = []
        for d in detail_list:
            data.append({
                "id": d.barang_id.id,
                "kode_barang": d.barang_id.kode_barang,
                "nama_barang": d.barang_id.nama_barang,
                "harga_jual": d.barang_id.harga_jual,
                "qty": d.qty_pesan,
                "diskon": d.diskon_barang,
                "total_diskon_barang": d.total_diskon_barang(),
                "total_harga_barang": d.total_harga_barang()
            })

        return Response(data)
    
class ReturJualBarangViewSet(viewsets.ModelViewSet):
    queryset = ReturJualBarang.objects.all()
    serializer_class = ReturJualBarangSerializer