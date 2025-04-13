document.addEventListener('DOMContentLoaded', () => {
    getKurir()
    getOptionBrg()
})

document.addEventListener("change", function (e) {
    if (e.target.classList.contains("kodebrg-dropdown")) {
      const lastRow = document.querySelector("tbody tr:last-child");
      const selectedValue = e.target.value;
  
      // Cek apakah dropdown dipilih dan belum pernah nambah baris baru
      if (selectedValue && !lastRow.classList.contains("new-row-added")) {
        addNewRow();
      }
    }
});
  

//PopupModal
function openModal() {
    let modal = document.getElementById("popupModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    let modal = document.getElementById("popupModal");
    modal.classList.remove("flex");
    modal.classList.add("hidden");
}

$(document).ready(function () {
    let table = $('#modalCustomer').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] } // kolom 8 dan 9 di tengah
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#customerSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

// const kodeBarang = ["0001273", "0001274", "0001275", "0001276", "0001277", "0001278"];
const searchKode = document.getElementById("searchKode");
const dropdownList = document.getElementById("dropdownList");

// function updateDropdown(filterText = "") {
//     let filteredItems = kodeBarang.filter(kode => kode.toLowerCase().includes(filterText.toLowerCase())).slice(0, 3);
//     let displayedItems = filteredItems.slice(0, filterText ? filteredItems.length : 3); // Default 3 item, cari semua saat input

//     dropdownList.innerHTML = displayedItems
//         .map(kode => `<li class="p-2 hover:bg-gray-100 cursor-pointer" onclick="selectKode(this)">${kode}</li>`)
//         .join("");

//     dropdownList.classList.toggle("hidden", displayedItems.length === 0);
// }

// Tampilkan 3 item default saat pertama kali input diklik
// searchKode.addEventListener("focus", () => {
//     updateDropdown();
// });

// Update dropdown berdasarkan pencarian
// searchKode.addEventListener("input", () => {
//     updateDropdown(searchKode.value);
// });

// Sembunyikan dropdown jika klik di luar
document.addEventListener("click", (event) => {
    if (!searchKode.contains(event.target) && !dropdownList.contains(event.target)) {
        dropdownList.classList.add("hidden");
    }
});

// Pilih item dan isi input
function selectKode(element) {
    searchKode.value = element.textContent;
    dropdownList.classList.add("hidden");
}

document.getElementById("toggleCheck").addEventListener("click", function () {
    document.getElementById("checkIcon").classList.toggle("hidden");
});

function confirmPopupBtn(detailId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/detailpesanan/${detailId}`, {
                method: "DELETE"
            })
            if (response.ok) {
                console.log("Pesanan dihapus!");
                const row = document.querySelector(`tr[data-id="${detailId}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
            } else {
                console.error("Gagal menghapus pesanan");
            }
        } catch (error) {
            console.error("Terjadi kesalahan: ",error);
        }
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}

document.querySelectorAll("tr").forEach(row => {
    const inputQty = row.querySelector(".input_qtybrg");
    const inputHarga = row.querySelector(".input_hrgbrg");
    const inputDiskon = row.querySelector(".disc");
    const totalDiscEl = row.querySelector(".totalDisc");
    const totalHargaEl = row.querySelector(".totalHarga");
    const barangId = row.querySelector("input[type='hidden']")?.value;
    const barangData = window.barangData
  
    if (!barangId || !inputQty || !inputHarga) return;
  
    const updateHarga = () => {
      const qty = parseInt(inputQty.value) || 0;
      const diskon = parseFloat(inputDiskon.value) || 0;
      const barang = barangData[barangId];
  
      if (!barang) return;
  
      let harga = barang.harga_jual;
      if (qty >= barang.min_qty_grosir2) {
        harga = barang.harga_satuan2;
      } else if (qty >= barang.min_qty_grosir1) {
        harga = barang.harga_satuan1;
      }
  
      inputHarga.value = harga;
  
      const totalDiskon = harga * qty * (diskon / 100);
      const totalHarga = harga * qty - totalDiskon;
  
      totalDiscEl.textContent = totalDiskon.toFixed(2);
      totalHargaEl.textContent = totalHarga.toFixed(2);
    };
  
    inputQty.addEventListener("input", updateHarga);
    inputDiskon.addEventListener("input", updateHarga);
});
  
async function getKurir() {
    try {
        let response = await fetch('/api/detailpesanan/kurir_choices/')
        let choices = await response.json()

        let select = document.getElementById("kurir")

        choices.forEach(choice => {
            let option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label
            select.appendChild(option)
        })
        let selectedKurir = "{{ detail_pesanan.merk|default:'' }}"
        if (selectedKurir) {
            select.value = selectedKurir
        }
    } catch (error) {
        console.error(error);
    }
}

function pilihCustomer(id, nama, toko) {
    let displayText = `${toko} - ${nama}`

    document.getElementById("customer").value = displayText

    let hiddenInput = document.getElementById("customer_id")
    if (hiddenInput) {
        hiddenInput.value = id
    }
    closeModal()
}

document.getElementById("tambahpesanform").addEventListener("submit", async(event) => {
    event.preventDefault()

    let id = document.getElementById("pesananId").value
    let kurir = document.getElementById("kurir").value
    let customer = document.getElementById("customerId").value
    let top = document.getElementById("top").value
    let alamat = document.getElementById("alamat_kirim").value
    let keterangan = document.getElementById("keterangan").value
    let ppn = document.getElementById("ppn").value
    let ongkir = document.getElementById("ongkir").value
    let diskon = document.getElementById("discount").value
    let barang = document.getElementById("barangId").value
    let qty = document.getElementById("input_qtybrg").value
    let diskonBarang = document.getElementById("disc").value
    
    const method = id ? "PATCH" : "POST" // jika ada id edit, tidak? tambah
    const apiPesanan = id ? `/api/pesanan/${id}/` : `/api/pesanan/`
    const apiDetail = id ? `/api/detailpesanan/${id}/` : `/api/detailpesanan/`

    if (!customer || !barang) {
        alert("Customer dan barang harus dipilih!")
        return
    }

    const pesanan = new FormData()
    pesanan.append("customer_id", customer)
    pesanan.append("ppn", ppn)
    pesanan.append("ongkir", ongkir)
    pesanan.append("diskon_pesanan", diskon)

    let response = await fetch(apiPesanan, {
        method: method,
        body: pesanan
    })
    let pesananData = await response.json()
    console.log(pesananData);

    if (pesananData.id) {
        const detailPesanan = new FormData()
        detailPesanan.append("pesanan_id", pesananData.id)
        detailPesanan.append("barang_id", barang)
        detailPesanan.append("kurir", kurir)
        detailPesanan.append("top", top)
        detailPesanan.append("alamat_kirim", alamat)
        detailPesanan.append("keterangan", keterangan)
        detailPesanan.append("qty_pesan", qty)
        detailPesanan.append("diskon_barang", diskonBarang)

        let detailResponse = await fetch(apiDetail, {
            method: method,
            body: detailPesanan
        })
        let detailData = await detailResponse.json()
        console.log(detailData);
    }
})

async function loadBarangOptions(selectId, selectedId = null) {
    let response = await fetch("/api/barang/")
    let data = await response.json()
    let select = document.getElementById(selectId)
    select.innerHTML = "<option disabled selected>Pilih Barang</option>"

    data.forEach(barang => {
        let option = document.createElement("option")
        option.value = barang.id
        option.text = barang.kode_barang
        if (barang.id == selectedId) {
            option.selected = true
        }
        select.appendChild(option)
    })
}

async function getOptionBrg() {
    const selects = document.querySelectorAll("[id^='kodebrg-dropdown-']")
    selects.forEach(select => {
        const selectedId = select.dataset.selectedId
        const namaBrgId = select.dataset.namaBarangId
        loadBarangOptions(select.id, selectedId)

        select.addEventListener("change", async() => {
            const barangId = select.value

            const response = await fetch(`/api/barang/${barangId}`)
            const data = await response.json()

            const namaBrgEl = document.getElementById(namaBrgId)
            if (namaBrgEl && data.nama_barang) {
                namaBrgEl.textContent = data.nama_barang
            }
        })
    })
}

function addNewRow() {
    const tbody = document.querySelector("tbody");
    const newRow = document.createElement("tr");
  
    const rowCount = tbody.querySelectorAll("tr").length + 1;
  
    newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
    newRow.innerHTML = `
      <td>${rowCount}</td>
      <td>
        <input type="hidden" id="barangId-${rowCount}" value="">
        <select id="kodebrg-dropdown-${rowCount}" class="kodebrg-dropdown" data-barang-id="">
          <option value="">Pilih Barang</option>
        </select>
      </td>
      <td class="kode-terpilih"></td>
      <td id="namaBrg-${rowCount}"></td>
      <td><input type="number" id="input_hrgbrg-${rowCount}" class="input_hrgbrg w-full rounded-md border-gray-300"/></td>
      <td><input type="number" id="input_qtybrg-${rowCount}" class="input_qtybrg w-20 rounded-md border-gray-300"/></td>
      <td><input type="number" id="disc-${rowCount}" class="disc w-20 rounded-md border-gray-300"/></td>
      <td id="totalDisc-${rowCount}" class="totalDisc"></td>
      <td id="totalHarga-${rowCount}" class="totalHarga"></td>
      <td><button type="submit"><i class="btn-simpan fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
      <td><button onclick="hapusRow(this)"><i class="btn-hapus fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `
  
    tbody.appendChild(newRow);

    loadBarangOptions(`kodebrg-dropdown-${rowCount}`);
}

function hapusRow(btn) {
    btn.closest("tr").remove()
}