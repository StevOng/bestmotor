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
    const submitBtn = document.getElementById("submitBtn")
    const warningText = document.getElementById("warningText")

    if (query.length === 0) {
        dropdownList.classList.add("hidden")
        dropdownList.innerHTML = ""
        submitBtn.disabled = false
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

                li.addEventListener("click", async () => {
                    barangId.value = item.id
                    searchKode.value = item.kode_barang
                    nama_barang.value = item.nama_barang
                    harga_barang.value = item.harga_jual
                    tipe.value = item.tipe
                    dropdownList.classList.add("hidden")

                    try {
                        const res = await fetch(`/api/katalogbarang/cek_barang/?barang_id=${item.id}`);
                        const data = await res.json();

                        if (data.sudah_ada) {
                            showWarningToast("Kode Barang", "Barang ini sudah ada di katalog");
                            warningText.classList.remove("hidden");
                            submitBtn.disabled = true;
                        } else {
                            warningText.classList.add("hidden");
                            submitBtn.disabled = false;
                        }
                    } catch (err) {
                        console.error("Gagal cek ke database:", err);
                        showWarningToast("Error", "Gagal cek data katalog");
                    }
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

document.addEventListener('DOMContentLoaded', () => {
    window.oldKatalogImages = window.oldKatalogImages || [];
    document.getElementById('formKatalog').addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const katalogId = parseInt(form.dataset.katalogId, 10) || null;
    const files = Array.from(form.querySelector('#upload_gambar').files);

    const baseFD = new FormData(form);

    // 2) Validate max-5 images
    if ((baseFD.getAll('gambar_pelengkap').length + files.length) > 5) {
        showWarningToast("Perhatian!", "Total gambar tidak boleh lebih dari 5");
        return;
    }

    // 3) Create or update the katalog header
    console.log("katalog id: ", katalogId)
    const url = katalogId ? `/api/katalog/${katalogId}/` : '/api/katalog/';
    const method = katalogId ? 'PUT' : 'POST';
    const headerResp = await fetch(url, {
        method,
        headers: { 'X-CSRFToken': getCSRFToken() },
        body: baseFD
    });
    if (!headerResp.ok) {
        const err = await headerResp.json().catch(() => null);
        console.error("Header save failed", err);
        showWarningToast("Gagal", "Gagal menyimpan data utama");
        return;
    }
    const { id } = await headerResp.json();

    // 5) Now upload each file — _including_ the katalog ID
    const uploads = files.map(file => {
        const fd = new FormData();
        for (let [key, val] of baseFD.entries()) {
            if (key !== 'gambar_pelengkap') fd.append(key, val);
        }
        fd.append('katalog', id);              // ← make sure this is here
        fd.append('gambar_pelengkap', file);

        // debug check:
        if (!/^\d+$/.test(fd.get('katalog'))) {
            throw new Error("Invalid katalog PK: " + fd.get('katalog'));
        }

        return fetch('/api/katalogbarang/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFToken() },
            body: fd
        });
    });
    // 6) Wait for all uploads & catch any failures
    const results = await Promise.all(uploads);
    for (let r of results) {
        if (!r.ok) {
            console.error(await r.text());
            showWarningToast("Gagal", "Beberapa gambar gagal diupload");
            return;
        }
    }

    // 7) Success!
    showSuccessToast("Berhasil", "Katalog dan gambar berhasil disimpan");
    window.location = '/katalog/admin/';
}

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

    toast.innerHTML = `
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