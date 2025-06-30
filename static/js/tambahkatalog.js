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
    const konsolId = document.getElementById("katalogId").value
    console.log("katalog id: ", konsolId)
    console.log("barang id: ", barangId.value)
    console.log("tipe-mtr: ", tipe.value)
})

document.addEventListener('DOMContentLoaded', () => {
    const checkIcon = document.getElementById("checkIcon");
    const isKatalogUtama = document.getElementById("isKatalogUtama");

    // Tampilkan icon centang jika value-nya true
    if (isKatalogUtama.value === "true" || isKatalogUtama.value === "True") {
        checkIcon.classList.remove("hidden");
    }
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
        const headWarn = "Peringatan Jumlah Upload"
        const parWarn = "Maksimal upload hanya 5 gambar"
        showWarningToast(headWarn, parWarn)
        uploadInput.value = ""
        previewDiv.innerHTML = ""
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

            const cekJumlah = await fetch(`/api/katalogbarang/?katalog=${result.id}/`);
            const data = await cekJumlah.json();
            let detailAPI = `/api/katalogbarang/`
            let detailMethod = "POST"
            if (id && data[index]) {
                detailAPI = `/api/katalogbarang/${data[index].id}/`
                detailMethod = "PATCH"
            }
            if (data.length + gambarPelengkap.length > 5) {
                alert("Total gambar melebihi batas maksimum (5).");
                return;
            }
            gambarPelengkap.forEach(async (gambar, index) => {
                const detail = new FormData()
                detail.append("katalog", result.id)
                detail.append("barang", barangId.value)
                detail.append("gambar_pelengkap", gambar)

                const detailAPI = id ? `/api/katalogbarang/${data[index].id}/` : `/api/katalogbarang/`
                const detailResp = await fetch(detailAPI, {
                    method: detailMethod,
                    headers: {
                        'X-CSRFToken': csrfToken
                    },
                    body: detail
                })
                const detailRes = await detailResp.json()
                if (!detailResp.ok) {
                    console.log("error: ", detailRes)
                    console.log("result id: ", result.id)
                } else {
                    console.log("success: ", detailRes)
                }
            })
            const headScs = "Berhasil"
            const parScs = "Data berhasil ditambah"
            showSuccessToast(headScs, parScs)
            setTimeout(() => {
                location.replace('/katalog/admin/');
            }, 1000);
        } else {
            const error = await response.json()
            const headScs = "Gagal"
            const parScs = "Gagal menambahkan data"
            showWarningToast(headScs, parScs)
            console.error("Gagal: ", error);
        }
    } catch (error) {
        console.error(error);
    }
})

function showWarningToast(head, msg) {
    const toast = document.getElementById("toastWarning");
    const title = document.getElementById("toastWarnHead");
    const paragraph = document.getElementById("toastWarnPar");

    title.innerText = head;
    paragraph.innerText = msg;

    toast.classList.remove("hidden");

    if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

    toast.toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2000);
}

function showSuccessToast(head, msg) {
    const toast = document.getElementById("toastSuccess");
    const title = document.getElementById("toastScs");
    const paragraph = document.getElementById("toastScsp");

    title.innerText = head;
    paragraph.innerText = msg;
    toast.classList.remove("hidden");

    if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

    toast.toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2000);
}