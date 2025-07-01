document.addEventListener("DOMContentLoaded", () => {
  getTipe()
  getMerk()
})

function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

const uploadInput = document.getElementById('upload_gambar');
const preview = document.getElementById("previewGambar");
const placeholder = document.getElementById("placeholder")

uploadInput.addEventListener('change', function () {
  const file = this.files[0]
  if (file) {
    preview.src = URL.createObjectURL(file)
    preview.style.display = "block"
    placeholder.textContent = file.name
  }
});

document.getElementById("tambahbrgform").addEventListener("submit", async (event) => {
  event.preventDefault()

  const id = document.getElementById("barangId").value
  const nama = document.getElementById("nama-brg").value
  const kode = document.getElementById("kode-brg").value
  const harga = document.getElementById("input-hrgbrg").value
  const tipe = document.getElementById("tipe-mtr").value
  const merk = document.getElementById("merk").value
  const minStok = document.getElementById("stok-minimum").value
  const gambar = document.getElementById("upload_gambar").files[0]
  const ket = document.getElementById("keterangan").value

  const method = id ? "PATCH" : "POST" // jika ada id edit, tidak? tambah
  const apiBarang = id ? `/api/barang/${id}/` : `/api/barang/`
  const csrfToken = getCSRFToken()

  const barang = new FormData()
  barang.append("nama_barang", nama)
  barang.append("kode_barang", kode)
  barang.append("harga_jual", harga)
  barang.append("tipe", tipe)
  barang.append("merk", merk)
  barang.append("stok_minimum", minStok)
  if (gambar) {
    barang.append("gambar", gambar)
  }
  barang.append("keterangan", ket)

  try {
    const response = await fetch(apiBarang, {
      method: method,
      headers: {
        'X-CSRFToken': csrfToken
      },
      body: barang
    });

    const barangData = await response.json();

    if (response.ok) {
      console.log("Barang berhasil disimpan:", barangData);

      if (barangData.id) {
        const tierDivs = document.querySelectorAll("#harga-tiers-container .harga-tier");

        tierDivs.forEach(div => {
          const minQty = div.querySelector(".min-qty").value;
          const hargaSatuan = div.querySelector(".harga-satuan").value;
          const tierId = div.dataset.id

          const formData = new FormData();
          formData.append("barang_id", barangData.id);
          formData.append("min_qty_grosir", minQty);
          formData.append("harga_satuan", hargaSatuan);

          const url = tierId ? `/api/tierharga/${tierId}/` : `/api/tierharga/`;
          const method = tierId ? "PATCH" : "POST";

          fetch(url, {
            method: method,
            body: formData,
          }).then(res => {
            if (!res.ok) console.error("Gagal simpan tier");
          });
        });
      }
      setTimeout(() => {
        location.replace("/barang/");
      }, 1000);
    } else {
      console.error("Gagal simpan barang:", barangData);
      showWarningToast("Gagal", "Gagal menyimpan data")
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
})

async function getTipe() {
  try {
    const response = await fetch('/api/barang/tipe_choices/')
    const choices = await response.json()

    const select = document.getElementById("tipe-mtr")

    let selectedTipe = select.dataset.selectedTipe

    choices.forEach(choice => {
      let option = document.createElement("option")
      option.value = choice.value
      option.textContent = choice.label
      if (choice.value === selectedTipe.toLowerCase()) {
        option.selected = true
        const placeholder = select.querySelector('option[value=""]')
        if (placeholder) placeholder.removeAttribute('selected')
      }
      select.appendChild(option)
    })
  } catch (err) {
    console.error(err)
  }
}

async function getMerk() {
  try {
    const response = await fetch('/api/barang/merk_choices/')
    const choices = await response.json()

    const select = document.getElementById("merk")

    let selectedMerk = select.dataset.selectedMerk

    choices.forEach(choice => {
      let option = document.createElement("option")
      option.value = choice.value
      option.textContent = choice.label
      if (choice.value === selectedMerk.toLowerCase()) {
        option.selected = true
        const placeholder = select.querySelector('option[value=""]')
        if (placeholder) placeholder.removeAttribute('selected')
      }
      select.appendChild(option)
    })
  } catch (err) {
    console.error(err)
  }
}


function addTier(input) {
  const tierContainer = document.getElementById("harga-tiers-container")
  const allTiers = tierContainer.querySelectorAll(".harga-tier")
  const lastTier = allTiers[allTiers.length - 1]

  allTiers.forEach(div => {
    const valQty = div.querySelector(".min-qty")
    const valHrg = div.querySelector(".harga-satuan")
    if (parseInt(valQty.value) <= 0 || parseFloat(valHrg.value) <= 0) {
      showWarningToast("Data Minus", "Harga, diskon dan kuantiti tidak boleh diisi minus")
      valQty.value = ""
      valHrg.value = ""
      return
    }
  })

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
      newTier.className = "harga-tier grid grid-cols-[1fr_1fr_1fr_24px] gap-2 items-center mt-1"
      newTier.innerHTML = `
                <div
                    class="block w-full bg-gray-200 border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-400"> Harga Grosir
                </div>
                <input type="number" 
                    class="min-qty block w-full border border-gray-300 rounded-md py-2 px-3 text-sm text-center text-gray-400" id="min-beli" oninput="addTier(this)" value="{{ detail_barang.min_qty_grosir|default:""}}"/>
                <input type="number"
                    class="harga-satuan block w-full border border-gray-300 rounded-md py-2 px-3 text-sm text-center text-gray-400" id="harga" oninput="addTier(this)" value="{{ detail_barang.harga_satuan|default:""}}" />
                <button type="button" onclick="hapusRow(this)" class="mt-1 mx-2"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button>
            `
      tierContainer.appendChild(newTier)
    }
  }
}

function hapusVal(btn) {
  const div = btn.closest("div")
  div.querySelector(".min-qty").value = ""
  div.querySelector(".harga-satuan").value = ""
}

function hapusRow(btn) {
    const div = btn.closest("div")
    div.classList.add("fade-out")
    setTimeout(() => div.remove(), 400)
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

  toast.innerHTML =`
      <div class="toast flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-100 shadow-lg">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 id="toastScs" class="text-sm font-medium text-yellow-800">${head}</h3>
          <p id="toastScsp" class="mt-1 text-sm text-yellow-600">${msg}</p>
        </div>
        <button onclick="document.getElementById('toastSuccess').classList.add('hidden')"  class="ml-auto text-yellow-400 hover:text-yellow-500">
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