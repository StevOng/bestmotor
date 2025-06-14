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

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

$(document).ready(function () {
    $('#detailBrg').DataTable({
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
    const detailId = data?.id || "";

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
      <td><button type="button" class="btn-submit" data-id="${detailId}"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
      <td><button type="button" onclick="hapusRow(this)"><i class="btn-hapus fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `;

    tbody.appendChild(newRow);

    setTimeout(() => {
        loadBarangOptions(selectId, barangId);
        getOptionBrg();
    }, 0);
}


function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}

async function submitDetail(element) {
    const button = element.closest("button")
    const id = button.dataset?.id
    const jenis = document.getElementById("jenis").value
    const barangIds = Array.from(document.querySelectorAll(".barang-id")).map(input => parseInt(input.value)).filter(val => !isNaN(val))//filter utk buang null
    const qtys = Array.from(document.querySelectorAll(".input_qtybrg")).map(input => parseInt(input.value)).filter(val => !isNaN(val))
    const ket = document.getElementById("keterangan").value
    console.log(barangIds);
    console.log(qtys)

    if (barangIds.length === 0) {
        alert("Barang harus dipilih");
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
            setTimeout(() => {
                location.replace(`/barang/transaksi/${jenis}/`);
            }, 1000);
        } else {
            console.error("Gagal:", result);
            alert("Gagal menyimpan transaksi: " + JSON.stringify(result));
        }
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
    }
}