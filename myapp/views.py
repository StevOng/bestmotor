from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import logout
from django.db.models import F, Case, When, Value, DecimalField
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import *
from .decorators import admin_required, both_required
import json

# Create your views here.
def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        try:
            admin = Admin.objects.get(username=username)
            if admin.password == password:
                request.session['user_type'] = 'admin'
                request.session['user_id'] = admin.id
                return redirect('dashboard')
            else:
                messages.error(request, "Password salah")
        except Admin.DoesNotExist:
            pass

        try:
            sales = Sales.objects.get(username=username)
            if sales.password == password:
                request.session['user_type'] = 'sales'
                request.session['user_id'] = sales.id
                return redirect('katalog')
            else:
                messages.error(request, "Password salah")
        except Sales.DoesNotExist:
            messages.error(request, "Username tidak ditemukan")

    return render(request, 'login.html')

def logout(request):
    logout(request)
    return redirect('login')

@both_required
def katalog(request):
    categories = ["Mesin", "Kelistrikan", "Suspensi", "Transmisi", "Body", "Ban & Velg", "Knalpot", "Oli Motor", "Aksesoris"]
    return render(request, "katalog.html", {"categories": categories})

@both_required
def katalogbrg(request):
    categories = ["Mesin", "Kelistrikan", "Suspensi", "Transmisi", "Body", "Ban & Velg", "Knalpot", "Oli Motor", "Aksesoris"]
    return render(request, "katalogbrg.html", {"categories": categories})

@admin_required
def deskripsi(request):
    return render(request, "deskripsi.html")

@admin_required
def dashboard(request):
    return render(request, 'dashboard.html')

@both_required
def pesanan(request, status):
    total_pending = Faktur.objects.filter(status='pending').count()
    total_ready = Faktur.objects.filter(status='ready').count()
    if status == 'pending':
        context = {
            "halaman" : "Data Pesanan Tertunda",
            "pesanan_list" : Faktur.objects.filter(status='pending').select_related(
                'detail_faktur',
                'customer',
                'sales'
            ),
            "total_pending" : total_pending,
            "total_ready" : total_ready
        }
    elif status == 'ready':
        context = {
            "halaman" : "Data Pesanan Siap Kirim",
            "pesanan_list" : Faktur.objects.filter(status='ready').select_related(
                'detail_faktur',
                'customer',
                'sales'
            ),
            "total_pending" : total_pending,
            "total_ready" : total_ready
        }
    else:
        context = {
            "halaman" : "Data Semua Pesanan",
            "pesanan_list" : Faktur.objects.all().select_related(
                'detail_faktur',
                'customer',
                'sales'
            ),
            "total_pending" : total_pending,
            "total_ready" : total_ready
        }
    return render(request, 'pesanan.html', context)

@csrf_exempt
def update_status_pesanan(request, pesanan_id):
    if request.method == 'POST':
        pesanan = get_object_or_404(Faktur, id=pesanan_id)
        action = request.POST.get('action')

        if action == 'accept':
            pesanan.status = 'ready'
            pesanan.save()
            return JsonResponse({'status': 'success', 'message': 'Status pesanan berhasil dirubah menjadi ready'})
        elif action == 'sent':
            pesanan.status = 'shipped'
            pesanan.save()
            return JsonResponse({'status': 'success', 'message': 'Status pesanan berhasil dirubah menjadi shipped'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Telah terjadi kesalahan'}, status=400)
        
    return JsonResponse({'status': 'error', 'message': 'Request tidak valid'}, status=400)

@csrf_exempt
def delete_pesanan(request, pesanan_id):
    if request.method == 'POST':
        pesanan = get_object_or_404(Faktur, id=pesanan_id)
        pesanan.delete()
        return JsonResponse({'status': 'success', 'message': 'Pesanan berhasil dihapus'})
    return JsonResponse({'status': 'error', 'message': 'Request tidak valid'}, status=400)

@both_required
def tambah_pesanan(request):
    mode = request.GET.get('mode','tambah') # default mode adalah tambah
    pesanan_id = request.GET.get('pesanan_id')
    customers = Customer.objects.all()

    pesanan = None
    if pesanan_id:
        pesanan = get_object_or_404(Faktur, id=pesanan_id)

    if pesanan:
        # ambil data barang terkait dengan faktur/pesanan
        barang_pesanan = pesanan.barang.annotate(
            harga = Case(
                When(detail_faktur__qty_pesanan__gte=F('detail_barang__min_beli_grosir_2'), then=F('detail_barang__harga_satuan_2')),
                When(detail_faktur__qty_pesanan__gte=F('detail_barang__min_beli_grosir_1'), then=F('detail_barang__harga_satuan_1')),
                default=F('harga_jual'),
                output_field=DecimalField()
            ),
            qty = F('detail_faktur__qty_pesanan'),
            disc = F('detail_faktur__diskon_barang')
        ).values(
            'id', 'detail_barang__kode', 'detail_barang__nama', 'harga', 'qty', 'disc'
        )
        bruto = sum((item['harga'] - item['disc']) * item['qty'] for item in barang_pesanan)
        nilai_ppn = bruto * (pesanan.detail_faktur.ppn / 100)
        netto = (bruto + nilai_ppn + pesanan.detail_faktur.ongkir) - pesanan.detail_faktur.diskon_faktur
    else:
        bruto = 0
        nilai_ppn = 0
        netto = 0
        barang_pesanan = []

    context = {
        'mode': mode,
        'customers': customers,
        'pesanan': pesanan,
        'barang_pesanan': list(barang_pesanan),
        'bruto': bruto,
        'nilai_ppn': nilai_ppn,
        'netto': netto
    }
    return render(request, 'tambahpesan.html', context)

@csrf_exempt
def simpan_barang(request):
    if request.method == 'POST':
        try:
            # Parse data JSON dari request body
            data = json.loads(request.body)
            customer_id = data.get('customer_id')
            sales_id = request.user.sales.id
            barang_ids = data.get('barang_ids')
            top = data.get('top')
            jatuh_tempo = data.get('jatuh_tempo')
            alamat_kirim = data.get('alamat_kirim')
            keterangan = data.get('keterangan')
            no_referensi = data.get('no_referensi')
            ppn = data.get('ppn')
            diskon_faktur = data.get('diskon_faktur')
            ongkir = data.get('ongkir')
            qty_pesanan = data.get('qty_pesanan')
            diskon_barang = data.get('diskon_barang')

            # Validasi data
            if not all([customer_id, sales_id, barang_ids, top, jatuh_tempo, alamat_kirim, no_referensi, ppn, diskon_faktur, ongkir, qty_pesanan, diskon_barang]):
                return JsonResponse({'success': False, 'error': 'Data tidak lengkap'})

            # Simpan data ke model DetailFaktur
            detail_faktur = DetailFaktur(
                top=top,
                jatuh_tempo=timezone.make_aware(timezone.datetime.strptime(jatuh_tempo, '%Y-%m-%d')),  # Konversi string ke datetime
                alamat_kirim=alamat_kirim,
                keterangan=keterangan,
                ppn=ppn,
                diskon_faktur=diskon_faktur,
                ongkir=ongkir,
                qty_pesanan=qty_pesanan,
                diskon_barang=diskon_barang,
            )
            detail_faktur.save()  # Simpan ke database

            customer = Customer.objects.get(id=customer_id)
            sales = Sales.objects.get(id=sales_id)

            for barang_id in barang_ids:
                barang = Barang.objects.get(id=barang_id)
                faktur = Faktur(
                    barang = barang,
                    detail_faktur = detail_faktur,
                    sales = sales,
                    customer = customer,
                    status = 'pending'
                )
                faktur.save()

            return JsonResponse({'success': True, 'id': detail_faktur.id})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Metode request tidak valid'})

@csrf_exempt
def hapus_barang(request, barang_id):
    if request.method == 'DELETE':
        try:
            barang = Barang.objects.get(id=barang_id)
            barang.delete()
            return JsonResponse({'success':True})
        except Barang.DoesNotExist:
            return JsonResponse({'success':False, 'error':'Barang tidak ditemukan'})
        except Exception as e:
            return JsonResponse({'success':False, 'error':str(e)})
    return JsonResponse({'success':False, 'error':'Metode request tidak valid'})

@both_required
def barang(request):
    return render(request, 'barang.html')

@both_required
def barang_rendah(request):
    return render(request, 'barang.html')

@both_required
def barang_laku(request):
    return render(request, 'barang.html')

@admin_required
def admin_katalog(request):
    return render(request, 'adminkatalog.html')

@admin_required
def tambah_brgkatalog(request):
    return render(request, 'tambahkatalog.html')

@both_required
def tambah_barang(request):
    return render(request, 'tambahbrg.html')

@admin_required
def transaksi_masuk(request):
    return render(request, 'transaksi.html')

@admin_required
def transaksi_keluar(request):
    return render(request, 'transaksi.html')

@admin_required
def tambah_masuk(request):
    return render(request, 'tambahtransaksi.html')

@admin_required
def tambah_keluar(request):
    return render(request, 'tambahtransaksi.html')

@admin_required
def supplier(request):
    return render(request, 'supplier.html')

@admin_required
def tambah_supplier(request):
    return render(request, 'tambahsupplier.html')

@both_required
def customer(request):
    return render(request, 'customer.html')

@both_required
def tambah_customer(request):
    return render(request, 'tambahcust.html')

@admin_required
def invoice(request):
    return render(request, 'invoice.html')

@admin_required
def invoice_belum(request):
    return render(request, 'invoice.html')

@admin_required
def invoice_jatuh(request):
    return render(request, 'invoice.html')

@admin_required
def tambah_invoice(request):
    return render(request, 'tambahinvoice.html')

@admin_required
def retur_beli(request):
    return render(request, 'returbeli.html')

@admin_required
def tambah_returbeli(request):
    return render(request, 'tambahreturbeli.html')

@admin_required
def hutang(request):
    return render(request, 'hutang.html')

@admin_required
def tambah_bayarhutang(request):
    return render(request, 'tambahhutang.html')

@both_required
def faktur(request):
    return render(request, 'faktur.html')

@both_required
def faktur_belum(request):
    return render(request, 'faktur.html')

@both_required
def faktur_jatuh(request):
    return render(request, 'faktur.html')

@both_required
def retur_jual(request):
    return render(request, 'returjual.html')

@both_required
def tambah_returjual(request):
    faktur = Faktur.objects.select_related('detail_faktur').get()
    noFaktur = faktur.detail_faktur.no_faktur
    return render(request, 'tambahreturjual.html', {'noFaktur':noFaktur})

@csrf_exempt
def simpan_retur(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            no_faktur = data.get('no_faktur')
            barang_retur = data.get('barang_retur')  # Format: [{'barang_id': 1, 'qty_retur': 2}, ...]

            ppn = data.get('ppn', 0)  # PPN dalam persen
            ongkir = data.get('ongkir', 0)
            diskon_faktur = data.get('diskon_faktur', 0)

            # Hitung bruto, nilai PPN, dan netto
            bruto = sum((item['harga'] - item['diskon_barang']) * item['qty_retur'] for item in barang_retur)
            nilai_ppn = bruto * (ppn / 100)
            netto = (bruto + nilai_ppn + ongkir) - diskon_faktur

            # Simpan retur penjualan
            retur = ReturPenjualan(
                no_bukti=ReturPenjualan.generate_no_bukti(),
                qty_retur=sum(item['qty_retur'] for item in barang_retur),
                total=netto
            )
            retur.save()

            # Update faktur dan barang
            faktur = Faktur.objects.get(no_faktur=no_faktur)
            for item in barang_retur:
                barang = Barang.objects.get(id=item['barang_id'])
                faktur_barang = faktur.faktur_barang.get(id=item['barang_id'])
                faktur_barang.qty_pesanan -= item['qty_retur']
                faktur_barang.save()

                # Update stok barang (jika diperlukan)
                barang.stok += item['qty_retur']
                barang.save()

            return JsonResponse({
                'success': True, 
                'id': retur.id,
                'bruto': bruto,
                'nilai_ppn': nilai_ppn,
                'netto': netto,
                'barang_retur': barang_retur
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Metode request tidak valid'})

@csrf_exempt
def delete_retur(request):
    if request.method == 'DELETE':
        try:
            retur_id = request.GET.get('id')  # Ambil ID retur dari parameter URL
            if not retur_id:
                return JsonResponse({'success': False, 'error': 'ID retur tidak ditemukan'})

            # Cari retur berdasarkan ID
            retur = ReturPenjualan.objects.get(id=retur_id)
            
            # Hapus retur
            retur.delete()

            return JsonResponse({'success': True, 'message': 'Retur berhasil dihapus'})
        except ReturPenjualan.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Retur tidak ditemukan'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Metode request tidak valid'})

@csrf_exempt
def get_faktur_detail(request):
    if request.method == 'GET':
        no_faktur = request.GET.get('no_faktur')
        if not no_faktur:
            return JsonResponse({'success': False, 'error': 'Parameter no_faktur diperlukan'})
        try:
            faktur = Faktur.objects.select_related('detail_faktur', 'customer').get(no_faktur=no_faktur)
            data = {
                'no_faktur': faktur.no_faktur,
                'no_referensi': faktur.detail_faktur.no_referensi,
                'customer': faktur.customer.nama,
                'tanggal_faktur': faktur.detail_faktur.created_at.strftime('%Y-%m-%d'),
                'ppn': faktur.detail_faktur.ppn,
                'ongkir': faktur.detail_faktur.ongkir,
                'diskon_faktur': faktur.detail_faktur.diskon_faktur,
                'barang': [
                    {
                        'barang_id': fb.barang.id,
                        'kode': fb.barang.detail_barang.kode,
                        'nama': fb.barang.detail_barang.nama,
                        'harga': fb.barang.harga_jual,
                        'qty_pesanan': fb.qty_pesanan,
                        'diskon_barang': fb.diskon_barang,
                    }
                    for fb in faktur.faktur_barang.all()
                ],
            }
            return JsonResponse({'success': True, 'data': data})
        except Faktur.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Faktur tidak ditemukan'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Metode request tidak valid'})

@csrf_exempt
def get_faktur_list(request):
    if request.method == 'GET':
        try:
            faktur_list = Faktur.objects.select_related('detail_faktur', 'custormer').all()
            data = []
            for faktur in faktur_list:
                data.append({
                    'no_faktur': faktur.detail_faktur.no_faktur,
                    'tanggal_faktur': faktur.detail_faktur.created_at.strftime('%d/%m/%Y'),
                    'no_referensi': faktur.detail_faktur.no_referensi,
                    'customer': faktur.customer.nama,
                    'total': faktur.total
                })
            return JsonResponse({'success':True, 'data':data})
        except Exception as e:
            return JsonResponse({'success':False, 'error':str(e)})
    return JsonResponse({'success':False, 'error':'Metode tidak valid'})

@both_required
def piutang(request):
    return render(request, 'piutang.html')

@both_required
def tambah_bayarpiutang(request):
    return render(request, 'tambahpiutang.html')

def bantuan(request):
    return render(request, 'bantuan.html')

def halaman403(request):
    return render(request, '403.html')

def halaman404(request):
    return render(request, '404.html')