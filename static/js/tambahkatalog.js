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
    previewDiv.innerHTML = ""
    const files = Array.from(this.files)
    if (files.length > 5) {
        const headWarn = "Peringatan Jumlah Upload"
        const parWarn = "Maksimal upload hanya 5 gambar"
        showWarningToast(headWarn, parWarn)
        uploadInput.value = ""
        placeholder.textContent = `Upload Gambar (0/5)`
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

  toast.innerHTML = `
    <div class="toast flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-100 shadow-lg">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 id="toastWarnHead" class="text-sm font-medium text-yellow-800">${head}</h3>
          <p id="toastWarnPar" class="mt-1 text-sm text-yellow-600">${msg}</p>
        </div>
        <button onclick="document.getElementById('toastWarning').classList.add('hidden')"  class="ml-auto text-yellow-400 hover:text-yellow-500">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
    </div>
  `

  toast.classList.remove("hidden");

  if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

  toast.toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

function showSuccessToast(head, msg) {
  const toast = document.getElementById("toastSuccess");

  toast.innerHTML =`
      <div class="toast flex items-start p-4 bg-green-50 rounded-lg border border-green-100 shadow-lg">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 id="toastScs" class="text-sm font-medium text-green-800">${head}</h3>
          <p id="toastScsp" class="mt-1 text-sm text-green-600">${msg}</p>
        </div>
        <button onclick="document.getElementById('toastSuccess').classList.add('hidden')"  class="ml-auto text-green-400 hover:text-green-500">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
  `

  toast.classList.remove("hidden");

  if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

  toast.toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}