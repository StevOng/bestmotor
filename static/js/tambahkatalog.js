const searchKode = document.getElementById("searchKode");
const dropdownList = document.getElementById("dropdownList");
const nama_barang = document.getElementById("nama-brg")
const kategori = document.getElementById("kategori")
const toggleCheck = document.getElementById("toggleCheck")
const checkIcon = document.getElementById("checkIcon")
const isKatalogUtama = document.getElementById("isKatalogUtama")

toggleCheck.addEventListener("click", () => {
    const isChecked = checkIcon.classList.toggle("hidden")
    isKatalogUtama.value = !isChecked // kalau icon kelihatan berarti true
})

// Sembunyikan dropdown jika klik di luar
document.addEventListener("click", (event) => {
    if (!searchKode.contains(event.target) && !dropdownList.contains(event.target)) {
        dropdownList.classList.add("hidden");
    }
});

searchKode.addEventListener("input", async () => {
    const query = this.value.trim()

    if (query.length === 0) {
        dropdownList.classList.add("hidden")
        dropdownList.innerHTML = ""
        return
    }

    try {
        const response = await fetch(`/api/barang/?search=${encodeURIComponent(query)}`)
        const data = await response.json()

        dropdownList.innerHTML = ""

        if (data.length > 0) {
            data.forEach(item => {
                const li = document.createElement("li")
                li.textContent = `${item.kode_barang} - ${item.nama_barang}`
                li.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer"

                li.addEventListener("click", () => {
                    searchKode.value = item.kode_barang
                    nama_barang.value = item.nama_barang
                    kategori.value = item.detailbarang.kategori
                    dropdownList.classList.add("hidden")
                })

                dropdownList.appendChild(li)
            });

            dropdownList.classList.remove("hidden")
        } else {
            const li = document.createElement("li")
            li.textContent = "Tidak ditemukan"
            li.className = "px-4 py-2 text-gray-400"
            dropdownList.appendChild(li)
            dropdownList.classList.remove("hidden")
        }
    } catch (error) {
        console.error(error);
    }
})

document.getElementById("formKatalog").addEventListener("submit", async(event) => {
    event.preventDefault()

    const id = document.getElementById("katalogId")?.value || null
    const hargaTertera = document.getElementById("hrgbrg").value
    const hargaDiskon = document.getElementById("hrgdsc").value
    const inKatalogUtama = isKatalogUtama.value === "true"
    
    const method = id ? "PATCH":"POST"
    const apiKatalog = id ? `/api/katalog/${id}/`:`/api/katalog/`

    const katalog = new FormData()
    katalog.append("harga_tertera", hargaTertera)
    katalog.append("harga_diskon", hargaDiskon)
    katalog.append("is_katalog_utama", inKatalogUtama)

    try {
        const response = await fetch(apiKatalog, {
            method: method,
            body: katalog
        })
        if (response.ok) {
            const result = await response.json()
            console.log("Berhasil: ", result);
        } else {
            const error = await response.json()
            console.error("Gagal: ", error);
        }
    } catch(error) {
        console.error(error);
    }
})