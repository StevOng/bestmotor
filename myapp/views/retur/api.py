from rest_framework import viewsets
from django.db import transaction
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
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
                return Response([], status=200)

            detail_qs = invoice.detailinvoice_set.select_related('barang_id')

            data = []
            for d in detail_qs:
                b = d.barang_id
                data.append({
                    "id": b.id,
                    "kode_barang": b.kode_barang,
                    "nama_barang": b.nama_barang,
                    "harga_modal": d.harga_beli,
                    "qty": d.qty_beli,
                    "diskon": d.diskon_barang,
                    "total_diskon_barang": d.total_diskon_barang(),
                    "total_harga_barang": d.total_harga_barang(),
                })

            return Response(data)

        # default jika tidak ada invId → tetap pakai bawaan ModelViewSet
        return super().list(request)
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        details = ReturBeliBarang.objects.filter(retur=instance)

        for detail in details:
            qty = detail.qty
            barang = detail.barang
            # Tambahkan kembali stok barang
            barang.stok += qty
            barang.save(update_fields=["stok"])

            # Rollback qty_retur di DetailInvoice
            try:
                detail_invoice = DetailInvoice.objects.get(
                    invoice_id=instance.invoice_id,
                    barang_id=barang.id
                )
            except DetailInvoice.DoesNotExist:
                raise ValidationError("Detail invoice tidak ditemukan.")

            if detail_invoice.qty_retur < qty:
                raise ValidationError("Qty retur melebihi yang tercatat di invoice.")

            detail_invoice.qty_retur -= qty
            detail_invoice.qty_beli += qty
            detail_invoice.save()
            
        invoice = instance.invoice_id
        invoice.netto += instance.subtotal
        invoice.bruto += instance.subtotal
        invoice.sisa_bayar += instance.subtotal
        invoice.save(update_fields=["netto", "bruto", "sisa_bayar"])

        # Hapus semua detail dan objek retur
        details.delete()
        instance.delete()
        
        return Response({"success": True, "message": "Retur beli berhasil dihapus."}, status=200)

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
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        details = ReturJualBarang.objects.filter(retur=instance)

        for detail in details:
            qty = detail.qty
            barang = detail.barang

            if barang.stok < qty:
                raise ValidationError("Stok tidak mencukupi untuk rollback retur.")
            barang.stok -= qty
            barang.save(update_fields=["stok"])

            detail_pesanan = DetailPesanan.objects.get(
                pesanan_id=instance.faktur_id.pesanan_id,
                barang_id=barang.id
            )
            if detail_pesanan.qty_retur < qty:
                raise ValidationError("Qty retur tidak valid.")
            detail_pesanan.qty_retur -= qty
            detail_pesanan.qty_pesan += qty
            detail_pesanan.save()
        
        faktur = instance.faktur_id
        faktur.pesanan_id.netto += instance.subtotal
        faktur.pesanan_id.bruto += instance.subtotal
        faktur.pesanan_id.save(update_fields=["netto", "bruto"])
        
        faktur.total += instance.subtotal
        faktur.sisa_bayar += instance.subtotal
        faktur.save(update_fields=["total", "sisa_bayar"])

        details.delete()
        instance.delete()
        
        return Response({"success": True, "message": "Retur jual berhasil dihapus."}, status=200)
    
class ReturJualBarangViewSet(viewsets.ModelViewSet):
    queryset = ReturJualBarang.objects.all()
    serializer_class = ReturJualBarangSerializer
    