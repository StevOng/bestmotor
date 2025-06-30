from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from ...models.retur import *
from .serializer import *

class ReturBeliViewSet(viewsets.ModelViewSet):
    queryset = ReturBeli.objects.all()
    serializer_class = ReturBeliSerializer

    @action(detail=True, methods=['get'], url_path='data')
    def get_invoice_data(self, request, pk=None):
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice tidak ditemukan"}, status=404)
        detail_qs = invoice.detailinvoice_set.select_related('barang_id')
    
        barang_list = []
        for d in detail_qs:
            b = d.barang_id
            barang_list.append({
                "barang_id": b.id,
                "kode_barang": b.kode_barang,
                "nama_barang": b.nama_barang,
                "harga_beli": float(d.harga_beli),
                "qty_beli": d.qty_beli,
                "diskon_barang": float(d.diskon_barang),
                "total_diskon_barang": float(d.total_diskon_barang()),
                "total_harga_barang": float(d.total_harga_barang())
            })
    
        return Response({
            "no_invoice": invoice.no_invoice,
            "tanggal": invoice.tanggal,
            "no_referensi": invoice.no_referensi,
            "top": invoice.top,
            "jatuh_tempo": invoice.jatuh_tempo,
            "bruto": invoice.bruto,
            "netto": invoice.netto,
            "ppn": invoice.ppn,
            "ongkir": invoice.ongkir,
            "diskon_invoice": invoice.diskon_invoice,
            "supplier": {
                "id": invoice.supplier_id.id,
                "perusahaan": invoice.supplier_id.perusahaan,
                "nama_sales": invoice.supplier_id.nama_sales,
            },
            "barang": barang_list
        })
        
    # def list(self, request):
    #     inv_id = request.GET.get('invId')
    #     if inv_id:
    #         try:
    #             invoice = Invoice.objects.get(id=inv_id)
    #         except Invoice.DoesNotExist:
    #             return Response([], status=404)

    #         detail_qs = invoice.detailinvoice_set.select_related('barang_id')

    #         data = []
    #         for d in detail_qs:
    #             b = d.barang_id
    #             data.append({
    #                 "id": b.id,
    #                 "kode_barang": b.kode_barang,
    #                 "nama_barang": b.nama_barang,
    #             })

    #         return Response(data)

    #     # default jika tidak ada invId → tetap pakai bawaan ModelViewSet
    #     return super().list(request)

class ReturBeliBarangViewSet(viewsets.ModelViewSet):
    queryset = ReturBeliBarang.objects.all()
    serializer_class = ReturBeliBarangSerializer

class ReturJualViewSet(viewsets.ModelViewSet):
    queryset = ReturJual.objects.all()
    serializer_class = ReturJualSerializer

    def get_queryset(self):
        faktur_id = self.request.query_params.get('fakturId')
        if faktur_id:
            try:
                faktur = Faktur.objects.select_related("pesanan_id__customer_id").get(id=faktur_id)
                return Barang.objects.filter(detailpesanan__pesanan_id=faktur.pesanan_id).distinct()
            except Faktur.DoesNotExist:
                return Barang.objects.none()
        return super().get_queryset()
    
class ReturJualBarangViewSet(viewsets.ModelViewSet):
    queryset = ReturJualBarang.objects.all()
    serializer_class = ReturJualBarangSerializer