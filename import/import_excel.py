import sys
import os
import django
import pandas as pd
from decimal import Decimal
import re

# Tambah path dan set environment Django
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

django.setup()

from myapp.models.barang import Barang

df = pd.read_excel("import/Data Barang DESEMBER 2024.xlsx", skiprows=2, usecols=["Nama Barang", "Merek", "Harga Modal", "Harga Jual", "Stok Akhir"])

df_clean = df.dropna().copy()

df_clean = df_clean[df_clean['Stok Akhir'] != 0].reset_index(drop=True)

split_result = df_clean['Nama Barang'].str.split(' - ', n=1, expand=True)
df_clean['Nama Barang'] = split_result[0]
df_clean['Tipe Motor'] = split_result[1]

# Mengambil 2 Huruf Inisial Pertama
def ambil_inisial(nama):
    nama = str(nama)
    kata = re.sub(r'[^\w\s]', '', nama).split()
    if len(kata) >= 2:
        return kata[0][0] + kata[1][0]
    elif len(kata) == 1:
        return kata[0][:2].upper()
    return "XX"

df_clean['Prefix'] = df_clean['Nama Barang'].apply(ambil_inisial).str.upper()

# Tambah nomor urut (zfill 2 angka)
df_clean['Nomor'] = (df_clean.index + 1).astype(str).str.zfill(4)

# Gabungkan jadi kode akhir
df_clean['Kode Barang'] = df_clean['Prefix'] + '-' + df_clean['Nomor']

# Stok Minimum
def hitung_stok_minimum(stok_akhir):
    if stok_akhir <= 20:
        return 5
    else:
        return int(stok_akhir * 0.2)
    
df_clean['Stok Akhir'] = df_clean['Stok Akhir'].astype(int)
df_clean['Stok Minimum'] = df_clean['Stok Akhir'].apply(hitung_stok_minimum)
df_clean['Qty Terjual'] = 0
df_clean['Gambar'] = b''
df_clean['Keterangan'] = ""

df_clean = df_clean[['Kode Barang', 'Nama Barang', 'Tipe Motor', 'Merek', 'Harga Jual', 'Stok Minimum', 'Harga Modal', 'Stok Akhir', 'Qty Terjual', 'Gambar', 'Keterangan']]

# Mulai proses insert
for _, row in df_clean.iterrows():
    try:
        Barang.objects.update_or_create(
            kode_barang=row['Kode Barang'],
            defaults={
                'nama_barang': row['Nama Barang'],
                'tipe': row['Tipe Motor'],
                'merk': row['Merek'],
                'harga_jual': Decimal(row['Harga Jual']),
                'stok_minimum': int(row['Stok Minimum']),
                'harga_modal': Decimal(row['Harga Modal']),
                'stok': int(row['Stok Akhir']),
                'qty_terjual': int(row['Qty Terjual']),
                'gambar': row['Gambar'],
                'keterangan': row['Keterangan'],
            }
        )
        print(f"Berhasil menambahkan: {row['Kode Barang']}")
    except Exception as e:
        print(f"Gagal menambahkan {row['Kode Barang']}: {e}")

print("Isi Setelah Penyesuaian :")
print(df_clean) 

# df_clean['Tipe Motor'] = df_clean['Tipe Motor'].str.lower().str.strip()
# df_clean['Merek'] = df_clean['Merek'].str.lower().str.strip()

# Pastikan nilai sesuai dengan choices
# print(set(df_clean['Tipe Motor']) - set(dict(TIPE).keys()))
# print(set(df_clean['Merek']) - set(dict(MERK).keys()))