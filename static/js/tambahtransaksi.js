document.addEventListener('DOMContentLoaded', () => {
    getOptionBrg()
    const tanggal = document.getElementById("tanggal")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate
})

document.querySelector(".input_qtybrg").addEventListener("input", callListener)

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

$(document).ready(function () {
    $('#detailBrg').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
    });
    $('.dt-search').remove();
    $('.dt-info').remove();
});


function confirmPopupBtn(attr) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = function () {
        const row = attr.closest("tr");

        row.querySelectorAll("input, select, textarea").forEach((el) => {
            el.value = "";
            if (el.tagName === "SELECT") el.selectedIndex = 0;
        });
        row.querySelectorAll("td").forEach((td, i) => {
            if (i == 2) td.textContent = ""
        })
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}

async function loadBarangOptions(selectId, selectedId) {
    let response = await fetch("/api/barang/")
    let data = await response.json()
    let select = document.getElementById(selectId)

    select.innerHTML = "<option disabled selected>Pilih Barang</option>"

    data.forEach(barang => {
        let option = document.createElement("option")
        option.value = barang.id
        option.text = barang.kode_barang
        if (selectedId !== null && selectedId !== "" && barang.id == selectedId) {
            option.selected = true
        }
        select.appendChild(option)
    })
}

async function getOptionBrg() {
    const selects = document.querySelectorAll("[id^='kodebrg-dropdown-']")
    selects.forEach(select => {
        const selectedId = select.dataset.selectedId
        console.log("selectedId: ", selectedId)
        console.log("select value: ", select.value)
        const namaBrgId = select.dataset.namaBarangId
        loadBarangOptions(select.id, select.value)

        select.addEventListener("change", async () => {
            const barangId = select.value
            const row = select.closest('tr')
            const hiddenInput = row.querySelector(".barang-id")
            if (hiddenInput) {
                hiddenInput.value = barangId
            }

            const response = await fetch(`/api/barang/${barangId}/`)
            const data = await response.json()

            const namaBrgEl = document.getElementById(namaBrgId)
            if (namaBrgEl && data.nama_barang) {
                namaBrgEl.textContent = data.nama_barang
            }
            // Cek apakah ini baris terakhir → baru tambahkan baris baru
            const allRows = document.querySelectorAll("tbody tr");
            const isLast = row === allRows[allRows.length - 1];
            if (isLast) {
                addNewRow();
            }
        })
    })
}

function addNewRow(data = null) {
    const tbody = document.querySelector("tbody");
    const newRow = document.createElement("tr");

    const rowCount = tbody.querySelectorAll("tr").length + 1;

    const selectId = `kodebrg-dropdown-${rowCount}`;
    const namaBrgId = `namaBrg-${rowCount}`;

    const barangId = data?.barang?.id || "";
    const namaBarang = data?.barang?.nama_barang || "";
    const qty = data?.qty_barang || "";

    newRow.classList.add("new-row-added");

    newRow.innerHTML = `
      <td>${rowCount}</td>
      <td>
        <input type="hidden" class="barang-id" value="${barangId}">
        <select id="${selectId}" class="kodebrg-dropdown" data-nama-barang-id="${namaBrgId}" data-selected-id="${barangId}">
          <option value="">Pilih Barang</option>
        </select>
      </td>
      <td id="${namaBrgId}">${namaBarang}</td>
      <td><input type="number" id="input_qtybrg-${rowCount}" value="${qty}" class="input_qtybrg w-20 rounded-md border-gray-300"/></td>
      <td><button type="button" onclick="submitDetail()" class="btn-submit"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
      <td><button type="button" onclick="hapusRow(this)"><i class="btn-hapus fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `;

    tbody.appendChild(newRow);

    setTimeout(() => {
        loadBarangOptions(selectId, barangId);
        getOptionBrg();
    }, 0);

    newRow.querySelector(".input_qtybrg").addEventListener("input", callListener)
}


function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}

async function submitDetail() {
    const id = document.getElementById("id")?.value
    const jenis = document.getElementById("jenis").value
    const barangIds = Array.from(document.querySelectorAll(".barang-id")).map(input => parseInt(input.value)).filter(val => !isNaN(val))//filter utk buang null
    const qtys = Array.from(document.querySelectorAll(".input_qtybrg")).map(input => parseInt(input.value)).filter(val => !isNaN(val))
    const ket = document.getElementById("keterangan").value
    console.log(barangIds);
    console.log(qtys)

    if (barangIds.length === 0) {
        showWarningToast("Data Kurang", "Isi barang diwajibkan")
        return;
    }

    const method = id ? "PUT" : "POST";
    const apiUrl = id
        ? `/api/transaksi${jenis}/${id}/`
        : `/api/transaksi${jenis}/`;
    const csrfToken = getCSRFToken()

    try {
        const detail_barang = barangIds.map((barangId, index) => ({
            barang: barangId,
            qty: qtys[index]
        }))
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                "keterangan": ket,
                'detail_barang': detail_barang
            }),
        });
        const result = await response.json();
        if (response.ok) {
            console.log("Transaksi & Detail berhasil disimpan:", result);
            showSuccessToast("Berhasil", "Berhasil meyimpan data")
            setTimeout(() => {
                location.replace(`/barang/transaksi/${jenis}/`);
            }, 1000);
        } else {
            console.error("Gagal:", result);
            showWarningToast("Gagal", "Gagal menyimpan data")
        }
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
    }
}

function minusCheck() {
    const allInput = document.querySelectorAll("input")
    allInput.forEach(input => {
        if (input.type == "number" && input.value < 0) {
            const headWarn = "Peringatan Input Minus"
            const parWarn = "Harga, diskon dan tanggal tidak bisa minus"
            showWarningToast(headWarn, parWarn)
            input.value = null
            updateDetailBiaya()
            return
        }
    })
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

function callListener() {
    minusCheck()
}