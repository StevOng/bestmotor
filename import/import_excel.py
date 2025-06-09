import pandas as pd
from decimal import Decimal
import re

df = pd.read_excel("Data Barang DESEMBER 2024.xlsx", skiprows=2, usecols=["Nama Barang", "Merek", "Harga Modal", "Harga Jual", "Stok Akhir"])

df_clean = df.dropna().copy()

df_clean = df_clean[df_clean['Stok Akhir'] != 0]

df_clean = df_clean.reset_index(drop=True)

split_result = df_clean['Nama Barang'].str.split(' - ', n=1, expand=True)
df_clean.loc[:, 'Nama Barang'] = split_result[0]
df_clean.loc[:, 'Tipe Motor'] = split_result[1]

# Mengambil 2 Huruf Inisial Pertama
def ambil_inisial(nama):
    nama = str(nama)
    kata = re.sub(r'[^\w\s]', '', nama).split()
    if len(kata) >= 2:
        return kata[0][0] + kata[1][0]
    elif len(kata) == 1:
        return kata[0][:2].upper()
    return "XX"

df_clean.loc[:, 'Prefix'] = df_clean['Nama Barang'].apply(ambil_inisial).str.upper()

# Tambah nomor urut (zfill 2 angka)
df_clean.loc[:, 'Nomor'] = (df_clean.index + 1).astype(str).str.zfill(4)

# Gabungkan jadi kode akhir
df_clean.loc[:, 'Kode Barang'] = df_clean['Prefix'] + '-' + df_clean['Nomor']

# Stok Minimum
def hitung_stok_minimum(stok_akhir):
    if stok_akhir <= 20:
        return 5
    else:
        return int(stok_akhir * 0.2)
    
df_clean.loc[:, 'Stok Akhir'] = df_clean['Stok Akhir'].astype(int)

df_clean.loc[:, 'Stok Minimum'] = df_clean['Stok Akhir'].apply(hitung_stok_minimum)
    
df_clean.loc[:, 'Qty Terjual'] = 0
df_clean.loc[:, 'Gambar'] = ""
df_clean.loc[:, 'Keterangan'] = ""

df_clean = df_clean[['Kode Barang', 'Nama Barang', 'Tipe Motor', 'Merek', 'Harga Jual', 'Stok Minimum', 'Harga Modal', 'Stok Akhir', 'Qty Terjual', 'Gambar', 'Keterangan']]

print("Isi Setelah Penyesuaian :")
print(df_clean)