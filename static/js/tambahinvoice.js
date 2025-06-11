document.addEventListener('DOMContentLoaded', function (e) {
    e.preventDefault()
    getOptionBrg()

    const tanggal = document.getElementById("tanggal_inv")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate
    console.log(formatDate);
})

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

document.querySelectorAll(".input_hrgbrg").forEach(input => {
    input.addEventListener("input", updateDetailBiaya)
})

document.querySelectorAll(".input_qtybrg").forEach(input => {
    input.addEventListener("input", updateDetailBiaya)
})

document.querySelectorAll(".disc").forEach(input => {
    input.addEventListener("input", updateDetailBiaya)
})

document.getElementById("ppn").addEventListener("input", updateDetailBiaya)

document.getElementById("ongkir").addEventListener("input", updateDetailBiaya)

document.getElementById("discount").addEventListener("input", updateDetailBiaya)

document.getElementById("top_inv").addEventListener("input", tanggalTop)

function tanggalTop() {
    const topInput = document.getElementById("top_inv")
    const jtoInput = document.getElementById("jatuh_tempo")

    const top = parseInt(topInput.value)
    let today = new Date()
    let jatuhTempo = new Date(today);
    jatuhTempo.setDate(today.getDate() + top);

    const yjto = jatuhTempo.getFullYear();
    const mjto = String(jatuhTempo.getMonth() + 1).padStart(2, "0");
    const djto = String(jatuhTempo.getDate()).padStart(2, "0");

    let formattedDate = `${djto}/${mjto}/${yjto}`;

    if (formattedDate) {
        jtoInput.value = formattedDate
    } else {
        jtoInput.value = "dd/mm/yyyy"
    }
}

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
    let table = $('#modalSupplier').DataTable({
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

    $('#supplierSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

function confirmPopupBtn(detailId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = function () {
        const row = document.querySelector(`tr[data-id="${detailId}"]`);
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
    select.innerHTML = "<option disabled selected>Kode</option>"

    data.forEach(barang => {
        let option = document.createElement("option")
        option.value = barang.id
        option.text = `${barang.kode_barang} - ${barang.nama_barang}`
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
          <input type="hidden" name="barangId-${rowCount}" class="barangId" value="${detail?.barang_id || ""}">
          <select id="kodebrg-dropdown-${rowCount}" data-nama-barang-id="namaBrg-${rowCount}" data-selected-id="${detail?.barang_id || ""}">
            <option value="Pilih Barang"></option>
          </select>
        </td>
        <td id="namaBrg-${rowCount}">${detail?.barang_id.nama_barang || ""}</td>
        <td><input type="number" value="${detail?.harga_beli || ""}" id="input_hrgbrg-${rowCount}" class="input_hrgbrg w-full rounded-md border-gray-300" /></td>
        <td><input type="number" value="${detail?.qty_beli || ""}" id="input_qtybrg-${rowCount}" class="input_qtybrg w-20 rounded-md border-gray-300" /></td>
        <td><input type="number" value="${detail?.diskon_barang || ""}" id="disc-${rowCount}" class="disc w-20 rounded-md border-gray-300" /></td>
        <td class="totalDisc">${detail?.total_diskon_barang || ""}</td>
        <td class="totalHarga">${detail?.total_harga_barang || ""}</td>
        <td><button type="submit" class="btn-submit" data-id=""><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
        <td><button onclick="hapusRow(this)"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);

    const btnSubmit = newRow.querySelector(".btn-submit")
    if (detail?.id) {
        btnSubmit.setAttribute("data-id", detail.id)
    }

    loadBarangOptions(`kodebrg-dropdown-${rowCount}`, detail?.barang_id || null);
}

function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}

function pilihSupplier(id, nama, perusahaan) {
    let displayText = `${perusahaan} - ${nama}`

    document.getElementById("supplier").value = displayText

    let hiddenInput = document.getElementById("supplierId")
    if (hiddenInput) {
        hiddenInput.value = id
    }
    closeModal()
}



document.querySelectorAll(".btn-submit").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
        event.preventDefault()

        const row = btn.closest("tr")
        const id = btn.dataset?.id || null
        const noInv = document.getElementById("no_invoice").value
        const hargaBeli = row.querySelector(".input_hrgbrg").value
        const qty = row.querySelector(".input_qtybrg").value
        const diskonBarang = row.querySelector(".disc").value
        const barangId = row.querySelector(".barangId")?.value || null
        const supplier = document.getElementById("supplierId")?.value || null
        const top = document.getElementById("top_inv").value
        const ppn = document.getElementById("ppn").value
        const ongkir = document.getElementById("ongkir").value
        const diskon = document.getElementById("discount").value

        if (supplier == "" || barangId == "") {
            alert("Supplier dan Barang harus dipilih")
            return
        }
        const invoice = new FormData()
        invoice.append("supplier_id", supplier)
        invoice.append("no_invoice", noInv)
        invoice.append("ppn", ppn)
        invoice.append("ongkir", ongkir)
        invoice.append("diskon_invoice", diskon)

        const method = id ? "PATCH" : "POST" // jika ada id edit, tidak? tambah
        const apiInvoice = id ? `/api/invoice/${id}/` : `/api/invoice/`
        const apiDetail = id ? `/api/detailinvoice/${id}/` : `/api/detailinvoice/`

        const response = await fetch(apiInvoice, {
            method: method,
            body: invoice
        })
        const invoiceData = await response.json()
        console.log(invoiceData);

        if (invoiceData.id) {
            const detailInvoice = new FormData()
            detailInvoice.append("invoice_id", invoiceData.id)
            detailInvoice.append("barang_id", barangId)
            detailInvoice.append("top", top)
            detailInvoice.append("harga_beli", hargaBeli)
            detailInvoice.append("qty_pesan", qty)
            detailInvoice.append("diskon_barang", diskonBarang)

            let detailResponse = await fetch(apiDetail, {
                method: method,
                body: detailInvoice
            })
            let detailData = await detailResponse.json()
            console.log(detailData);
        }
    })
})

function updateDetailBiaya() {
    let bruto = 0
    const brutoEl = document.getElementById("bruto")
    const ppnInput = document.getElementById("ppn")
    const ongkirInput = document.getElementById("ongkir")
    const discInvInput = document.getElementById("discount")
    const niliaPpnEl = document.getElementById("nilai_ppn")
    const nettoEl = document.getElementById("netto")
    document.querySelectorAll("tr").forEach(row => {
        const hargaBrgInput = row.querySelector(".input_hrgbrg")
        const qtyBrgInput = row.querySelector(".input_qtybrg")
        const dicBrgInput = row.querySelector(".disc")
        const totalDiscEl = row.querySelector(".totalDisc");
        const totalHargaEl = row.querySelector(".totalHarga");

        if (!hargaBrgInput || !qtyBrgInput || !dicBrgInput || !totalDiscEl || !totalHargaEl) {
            return
        }

        const harga = parseFloat(hargaBrgInput.value) || 0
        const qty = parseInt(qtyBrgInput.value) || 0
        const disc = parseFloat(dicBrgInput.value) || 0

        const totalDiscBrg = harga * qty * (disc/100)
        const totalNilaiBrg = harga * qty - totalDiscBrg

        totalDiscEl.textContent = totalDiscBrg
        totalHargaEl.textContent = totalNilaiBrg
        bruto += totalNilaiBrg
    })
    brutoEl.value = bruto
    const nilaiPpn = bruto * (ppnInput.value / 100)
    const netto = bruto + nilaiPpn + Number(ongkirInput.value) - discInvInput.value

    niliaPpnEl.value = nilaiPpn
    nettoEl.value = netto
}