document.addEventListener("DOMContentLoaded", () => {
    getKategori()
    getMerk()
})

const uploadInput = document.getElementById('upload_gambar');
const placeholder = document.getElementById('placeholder');

uploadInput.addEventListener('change', () => {
    const fileCount = uploadInput.files.length;
    placeholder.textContent = `Upload Gambar (${fileCount}/5)`;
});

document.getElementById("tambahbrgform").addEventListener("submit", async(event) => {
    event.preventDefault()

    const id = document.getElementById("barangId").value
    const nama = document.getElementById("nama-brg").value
    const kode = document.getElementById("kode-brg").value
    const harga = document.getElementById("input-hrgbrg").value
    const kategori = document.getElementById("kategori").value
    const merk = document.getElementById("merk").value
    const minStok = document.getElementById("stok-minimum").value
    const grosir1 = document.getElementById("min-beli1").value
    const jual1 = document.getElementById("harga1").value
    const grosir2 = document.getElementById("min-beli2").value
    const jual2 = document.getElementById("harga2").value
    const gambar = document.getElementById("upload_gambar").files[0]
    const ket = document.getElementById("keterangan").value

    const method = id ? "PUT" : "POST" // jika ada id edit, tidak? tambah
    const apiBarang = id ? `/api/barang/${id}/` : `/api/barang/`
    const apiDetail = id ? `/api/detailbarang/${id}/` : `/api/detailbarang/`

    const barang  = new FormData()
    barang.append("nama_barang", nama)
    barang.append("kode_barang", kode)

    let response = await fetch(apiBarang, {
        method: method,
        body: barang
    })
    let barangData = await response.json()
    console.log(barangData);
    
    if (barangData.id) {
        const detailBrg = new FormData()
        detailBrg.append("barang_id", barangData.id)
        detailBrg.append("harga_jual", harga)
        detailBrg.append("kategori", kategori)
        detailBrg.append("merk", merk)
        detailBrg.append("stok_minimum", minStok)
        detailBrg.append("min_qty_grosir1", grosir1)
        detailBrg.append("harga_satuan1", jual1)
        detailBrg.append("min_qty_grosir2", grosir2)
        detailBrg.append("harga_satuan2", jual2)
        if (gambar) {
            detailBrg.append("gambar", gambar)
        }
        detailBrg.append("keterangan", ket)

        let detailResponse = await fetch(apiDetail, {
            method: method,
            body: detailBrg
        })
        let detailData = await detailResponse.json()
        console.log(detailData);
    }
})

async function getKategori() {
    try{
        const response = await fetch('/api/detailbarang/kategori_choices/')
        const choices = await response.json()

        const select = document.getElementById("kategori")
        // select.innerHTML = '<option value="" disabled>Masukkan kategori barang</option>';
        choices.forEach(choice => {
            let option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label
            select.appendChild(option)
        })
        let selectedKategori = "{{ detail_barang.kategori|default:'' }}"
        if (selectedKategori) {
            select.value = selectedKategori
        }
    } catch(err) {
        console.error(err);
    }
}

async function getMerk() {
    try{
        const response = await fetch('/api/detailbarang/merk_choices/')
        const choices = await response.json()

        const select = document.getElementById("merk")
        // select.innerHTML = '<option value="" disabled>Masukkan merk barang</option>';
        choices.forEach(choice => {
            let option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label
            select.appendChild(option)
        })
        let selectedMerk = "{{ detail_barang.merk|default:'' }}"
        if (selectedMerk) {
            select.value = selectedMerk
        }
    } catch(err) {
        console.error(err);
    }
}