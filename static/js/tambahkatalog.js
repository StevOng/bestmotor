let searchKode = document.getElementById("searchKode");
let dropdownList = document.getElementById("dropdownList");
let nama_barang = document.getElementById("nama-brg")
let harga_barang = document.getElementById("hrgbrg")
let tipe = document.getElementById("tipe-mtr")
let toggleCheck = document.getElementById("toggleCheck")
let checkIcon = document.getElementById("checkIcon")
let isKatalogUtama = document.getElementById("isKatalogUtama")
let barangId = document.getElementById("barangId")

toggleCheck.addEventListener("click", () => {
    const isChecked = checkIcon.classList.toggle("hidden")
    isKatalogUtama.value = !isChecked // kalau icon kelihatan berarti true
    console.log(isKatalogUtama.value)
})

// Sembunyikan dropdown jika klik di luar
document.addEventListener("click", (event) => {
    if (!searchKode.contains(event.target) && !dropdownList.contains(event.target)) {
        dropdownList.classList.add("hidden");
    }
});

const uploadInput = document.getElementById('upload_gambar');
const placeholder = document.getElementById("placeholder")
const previewDiv = document.getElementById("previewDiv")

uploadInput.addEventListener('change', function () {
    const files = Array.from(this.files)
    if (files.length + previewDiv.children.length > 5) {
        alert("Maksimal upload hanya 5 gambar")
        uploadInput.value = ""
        placeholder.textContent = `Upload Gambar (${previewDiv.children.length}/5)`
        return
    }
    files.forEach(file => {
        const img = document.createElement("img")
        img.src = URL.createObjectURL(file)
        img.style.maxWidth = "120px"
        img.style.display = "block"
        img.style.margin = "2px"
        previewDiv.appendChild(img)
    })
    placeholder.textContent = `Upload Gambar (${previewDiv.children.length}/5)`
});

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

searchKode.addEventListener("input", async (event) => {
    const query = event.target.value.trim()

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
                    barangId.value = item.id
                    searchKode.value = item.kode_barang
                    nama_barang.value = item.nama_barang
                    harga_barang.value = item.harga_jual
                    tipe.value = item.tipe
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

document.getElementById("formKatalog").addEventListener("submit", async (event) => {
    event.preventDefault()

    const id = document.getElementById("katalogId")?.value
    const hargaTertera = document.getElementById("hrgbrg").value
    const hargaDiskon = document.getElementById("hrgdsc").value
    const gambarPelengkap = Array.from(document.getElementById("upload_gambar").files)
    const inKatalogUtama = isKatalogUtama.value

    const method = id ? "PUT" : "POST"
    const apiKatalog = id ? `/api/katalog/${id}/` : `/api/katalog/`
    const csrfToken = getCSRFToken()

    const katalog = new FormData()
    katalog.append("harga_tertera", hargaTertera)
    katalog.append("harga_diskon", hargaDiskon)
    katalog.append("is_katalog_utama", inKatalogUtama)
    gambarPelengkap.forEach((gambar, index) => {
        katalog.append(`promosi_barang[${index}][barang]`, barangId)
        katalog.append(`promosi_barang[${index}][gambar_pelengkap]`, gambar)
    })

    try {
        const response = await fetch(apiKatalog, {
            method: method,
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: katalog
        })
        if (response.ok) {
            const result = await response.json()
            console.log("Berhasil: ", result);
        } else {
            const error = await response.json()
            console.error("Gagal: ", error);
        }
    } catch (error) {
        console.error(error);
    }
})