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

  const id = document.getElementById("barangId")?.value
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
      alert("Gagal menyimpan barang: " + JSON.stringify(barangData));
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