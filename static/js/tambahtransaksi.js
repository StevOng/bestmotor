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

function confirmPopupBtn(id) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox
    const jenis = document.getElementById("jenis").value

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = function () {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        row.querySelectorAll("input, select, textarea").forEach((el) => {
            el.value = ""
            if (el.tagName == "select") {
                el.selectedIndex = 0
            }
        })
        row.removeAttribute("data-id")
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}

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

        select.addEventListener("change", async () => {
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
        <input type="hidden" id="barangId-${rowCount}" value="${data?.barang.id || ""}">
        <select id="kodebrg-dropdown-${rowCount}" class="kodebrg-dropdown" data-nama-barang-id="namaBrg-${rowCount}" data-selected-id="${data?.barang.id || ""}">
          <option value="">Pilih Barang</option>
        </select>
      </td>
      <td id="namaBrg-${rowCount}">${data?.barang.nama_barang || ""}</td>
      <td><input type="number" id="input_qtybrg-${rowCount}" value="${data?.qty_barang || ""}" class="input_qtybrg w-20 rounded-md border-gray-300"/></td>
      <td><button type="submit" class="btn-submit" data-id=""><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
      <td><button onclick="hapusRow(this)"><i class="btn-hapus fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);

    const btnSubmit = newRow.querySelector(".btn-submit")
    if (data?.id) {
        btnSubmit.setAttribute("data-id", data.id)
    }

    loadBarangOptions(`kodebrg-dropdown-${rowCount}`, data?.barang_id || null);
}

function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}

document.querySelectorAll(".btn-submit").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
        event.preventDefault();

        const row = btn.closest("tr");
        const id = btn.dataset?.id || null
        const jenis = document.getElementById("jenis").value
        const barangId = row.querySelector(".barang-id")?.value || null
        const qty = row.querySelector(".input-qtybrg").value
        const ket = row.getElementById("keterangan").value

        if (!barangId) {
            alert("Barang harus dipilih");
            return;
        }

        const transaksi = new FormData();
        transaksi.append("keterangan", ket);
        if (jenis === "masuk") {
            transaksi.append("qty_masuk", qty);
        } else {
            transaksi.append("qty_keluar", qty);
        }

        const method = id ? "PATCH" : "POST";
        const apiUrl = id
            ? `/api/transaksi${jenis}/${id}/`
            : `/api/transaksi${jenis}/`;

        try {
            const response = await fetch(apiUrl, {
                method: method,
                body: transaksi,
            });
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error("Terjadi kesalahan:", error);
        }
    });
});