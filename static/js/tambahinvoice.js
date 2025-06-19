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

function confirmPopupBtn(attr) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = () => {
        const row = attr.closest("tr")
        row.querySelectorAll("input, select, textarea").forEach((el) => {
            el.value = ""
            if (el.tagName == "select") {
                el.selectedIndex = 0
            }
        })
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
    select.innerHTML = "<option disabled selected>Kode</option>"

    data.forEach(barang => {
        let option = document.createElement("option")
        option.value = barang.id
        option.text = `${barang.kode_barang} - ${barang.nama_barang}`
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
        const namaBrgId = select.dataset.namaBarangId
        console.log("selectedId: ", selectedId)
        console.log("select value: ", select.value)
        loadBarangOptions(select.id, selectedId)

        select.addEventListener("change", async () => {
            const barangId = select.value
            const row = select.closest('tr')
            const hiddenInput = row.querySelector(".barangId")
            if (hiddenInput) {
                hiddenInput.value = barangId
            }

            const response = await fetch(`/api/barang/${barangId}/`)
            const data = await response.json()

            const namaBrgEl = document.getElementById(namaBrgId)
            if (namaBrgEl && data.nama_barang) {
                namaBrgEl.textContent = data.nama_barang
            }
            const hargaInput = row.querySelector(".input_hrgbrg")
            if (hargaInput) {
                hargaInput.value = data.harga_modal
            }
            updateDetailBiaya()

            // Cek apakah ini baris terakhir → baru tambahkan baris baru
            const allRows = document.querySelectorAll("tbody tr");
            const isLast = row === allRows[allRows.length - 1];
            if (isLast) {
                addNewRow();
            }
        })
    })
}

function addNewRow(detail = null) {
    const tbody = document.querySelector("tbody");
    const newRow = document.createElement("tr");

    const selectId = `kodebrg-dropdown-${rowCount}`;
    const barangId = detail?.barang_id || ""

    const rowCount = tbody.querySelectorAll("tr").length + 1;

    newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td>
          <input type="hidden" name="barangId-${rowCount}" class="barangId" value="${barangId}">
          <select id="${selectId}" class="kodebrg-dropdown" data-nama-barang-id="namaBrg-${rowCount}" data-selected-id="${barangId}">
            <option value="">Pilih Barang</option>
          </select>
        </td>
        <td id="namaBrg-${rowCount}">${detail?.barang_id?.nama_barang || ""}</td>
        <td><input type="number" value="${detail?.harga_beli || 0}" id="input_hrgbrg-${rowCount}" class="input_hrgbrg w-full rounded-md border-gray-300" /></td>
        <td><input type="number" value="${detail?.qty_beli || 0}" id="input_qtybrg-${rowCount}" class="input_qtybrg w-20 rounded-md border-gray-300" /></td>
        <td><input type="number" value="${detail?.diskon_barang || 0}" id="disc-${rowCount}" class="disc w-20 rounded-md border-gray-300" /></td>
        <td class="totalDisc">${detail?.total_diskon_barang || ""}</td>
        <td class="totalHarga">${detail?.total_harga_barang || ""}</td>
        <td><button type="button" onclick="submitDetail()" class="btn-submit"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
        <td><button type="button onclick="hapusRow(this)"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);

    // deferring execution
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

function pilihSupplier(id, nama, perusahaan) {
    let displayText = `${perusahaan} - ${nama}`

    document.getElementById("supplier").value = displayText

    let hiddenInput = document.getElementById("supplierId")
    if (hiddenInput) {
        hiddenInput.value = id
    }
    closeModal()
}

async function submitDetail() {
    const id = document.getElementById("invoiceId")?.value
    const noInv = document.getElementById("no_invoice").value
    const hargaBelis = Array.from(document.querySelectorAll(".input_hrgbrg")).map(input => parseFloat(input.value)).filter(val => !isNaN(val))
    const qtys = Array.from(document.querySelectorAll(".input_qtybrg")).map(input => parseInt(input.value)).filter(val => !isNaN(val))
    const diskonBarangs = Array.from(document.querySelectorAll(".disc")).map(input => parseFloat(input.value)).filter(val => !isNaN(val))
    const barangIds = Array.from(document.querySelectorAll(".barangId")).map(input => parseInt(input.value)).filter(val => !isNaN(val))
    const supplier = document.getElementById("supplierId")?.value
    const top = document.getElementById("top_inv").value
    const ppn = document.getElementById("ppn").value
    const ongkir = document.getElementById("ongkir").value
    const diskon = document.getElementById("discount").value

    if (supplier == "" || barangIds == "") {
        alert("Supplier dan Barang harus dipilih")
        return
    }

    if (qtys < 0 || diskonBarangs < 0) {
        alert("Kuantiti dan diskon barang tidak bisa minus")
        return
    }
    const method = id ? "PUT" : "POST";
    const apiUrl = id ? `/api/invoice/${id}/` : `/api/invoice/`
    const csrfToken = getCSRFToken()
    try {
        const detail_barang = barangIds.map((barangId, index) => ({
            barang_id: barangId,
            qty_beli: qtys[index],
            harga_beli: hargaBelis[index],
            diskon_barang: diskonBarangs[index]
        }))
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                "supplier_id": supplier,
                "no_invoice": noInv,
                "top": top,
                "ppn": ppn,
                "ongkir": ongkir,
                "diskon_invoice": diskon,
                "detail_barang": detail_barang
            })
        })
        const result = await response.json()
        if (response.ok) {
            console.log("Invoice & Detail berhasil disimpan:", result);
            setTimeout(() => {
                location.replace(`/pembelian/invoice/`);
            }, 1000);
        } else {
            console.error("Gagal:", result);
            alert("Gagal menyimpan invoice: " + JSON.stringify(result));
        }
    } catch (error) {
        console.error("Terjadi kesalahan: ", error)
    }
}

document.querySelectorAll(".btn-submit").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
        event.preventDefault()

        const row = btn.closest("tr")
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

        const totalDiscBrg = harga * qty * (disc / 100)
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