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
    const gambar = document.getElementById("upload_gambar").files[0]
    const ket = document.getElementById("keterangan").value

    const method = id ? "PATCH" : "POST" // jika ada id edit, tidak? tambah
    const apiBarang = id ? `/api/barang/${id}/` : `/api/barang/`

    const barang  = new FormData()
    barang.append("nama_barang", nama)
    barang.append("kode_barang", kode)
    barang.append("harga_jual", harga)
    barang.append("kategori", kategori)
    barang.append("merk", merk)
    barang.append("stok_minimum", minStok)
    if (gambar) {
        barang.append("gambar", gambar)
    }
    barang.append("keterangan", ket)

    const response = await fetch(apiBarang, {
        method: method,
        body: barang
    })
    const barangData = await response.json()
    console.log(barangData);
    
    if (barangData.id) {
        const tierDivs = document.querySelectorAll("#harga-tiers-container .harga-tier")

        for (const div of tierDivs) {
            const minQty = div.querySelector(".min-qty").value
            const hargaSatuan = div.querySelector(".harga-satuan").value

            if (minQty && hargaSatuan) {
                const tierData = new FormData()
                tierData.append("barang_id", barangData.id)
                tierData.append("min_qty_grosir", minQty)
                tierData.append("harga_satuan", hargaSatuan)

                const tierResp = await fetch(`/api/tierharga/`, {
                    method: "POST",
                    body: tierData
                })

                if (!tierResp.ok) {
                    const err = await tierResp.json()
                    console.error("Gagal simpan tier harga: ", err)
                }
            }
        }
    }
})

async function getKategori() {
    try{
        const response = await fetch('/api/barang/kategori_choices/')
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
        const response = await fetch('/api/barang/merk_choices/')
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

function addTier(input) {
    const tierContainer = document.getElementById("harga-tiers-container")
    const allTiers = tierContainer.querySelectorAll(".harga-tier")
    const lastTier = allTiers[allTiers.length - 1]

    const minQty = lastTier.querySelector(".min-qty").value
    const hargaSatuan = lastTier.querySelector(".harga-satuan").value

    if (minQty && hargaSatuan) {
        const isEmptyTierExist = Array.from(allTiers).some(tier => {
            const qty = tier.querySelector(".min-qty").value
            const harga = tier.querySelector(".harga-satuan").value
            return qty === "" || harga === ""
        })
        if (!isEmptyTierExist) {
            const newTier = document.createElement("div")
            newTier.className = "harga-tier flex"
            newTier.innerHTML = `
                <div
                    class="mt-1 mr-1 block w-full bg-gray-200 border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-400"> Harga Grosir
                </div>
                <input type="number" 
                    class="min-qty mt-1 mx-2 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm text-center text-gray-400" id="min-beli" oninput="addTier(this)" value="{{ detail_barang.min_qty_grosir|default:""}}"/>
                <input type="number"
                    class="harga-satuan mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm text-center text-gray-400" id="harga" oninput="addTier(this)" value="{{ detail_barang.harga_satuan|default:""}}" />
            `
            tierContainer.appendChild(newTier)
        }
    }
}