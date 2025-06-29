document.addEventListener('DOMContentLoaded', () => {
    getOptionBrg()

    const tanggal = document.getElementById("tanggal_inv")
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
    });
    $('.dt-search').remove();
    $('.dt-info').remove();
});

$(document).ready(function () {
    let table = $('#modalInvoice').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#invoiceSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
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

//PopupModal
function openModal() {
    let modal = document.getElementById("popupModalInv");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    const modal = document.getElementById("popupModalInv");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}

async function loadBarangOptions(selectId, selectedId = null, invId = null) {
    let url = "/api/returbeli/";
    if (invId) {
        url += `?invId=${invId}`;
    }

    let response = await fetch(url);
    let data = await response.json();
    let select = document.getElementById(selectId);
    select.innerHTML = "<option disabled selected>Pilih Barang</option>";

    data.forEach(barang => {
        let option = document.createElement("option");
        option.value = barang.id;
        option.text = barang.kode_barang;
        if (barang.id == selectedId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

async function getOptionBrg() {
    const selects = document.querySelectorAll("[id^='kodebrg-dropdown-']")
    const invId = document.getElementById("invId")?.value
    selects.forEach(select => {
        const selectedId = select.dataset.selectedId
        const namaBrgId = select.dataset.namaBarangId
        console.log("selectedId: ", selectedId)
        console.log("select value: ", select.value)
        loadBarangOptions(select.id, selectedId, invId)

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
                hargaInput.value = data.harga_jual
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

function addNewRow(inv = null) {
    const tbody = document.querySelector("#detailBrg tbody");
    const newRow = document.createElement("tr");
    const rowCount = tbody.querySelectorAll("tr").length + 1;

    const selectId = `kodebrg-dropdown-${rowCount}`;
    const barangId = inv?.barang_id || ""
    const invId = inv?.invoice_id || ""

    newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td>
          <input type="hidden" name="barangId" class="barangId" value="${barangId}">
          <select id="${selectId}" class="kodebrg-dropdown" data-namaBrg="namaBrg-${rowCount}" data-selected-id="${barangId}">
            <option value="${barangId}" selected>${inv?.barang_id?.kode_barang || ""} - ${inv?.barang_id?.nama_barang || ""}</option>
          </select>
        </td>
        <td id="namaBrg-${rowCount}">
          ${inv?.barang_id?.nama_barang || ""}
        </td>
        <td><input type="number" value="${inv?.harga_beli || ""}" class="input_hrgbrg w-full rounded-md border-gray-300" /></td>
        <td><input type="number" value="${inv?.qty_retur || ""}" class="input_qtybrg w-20 rounded-md border-gray-300" /></td>
        <td><input type="number" value="${inv?.diskon_barang || ""}" class="disc w-20 rounded-md border-gray-300" /></td>
        <td class="totalDisc">${inv?.total_diskon_barang || ""}</td>
        <td class="total">${inv?.total_harga_barang || ""}</td>
        <td class="text-center"><button type="button" onclick="submitDetail()" class="btn-submit"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
        <td class="text-center"><button onclick="hapusRow(this)"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);
    // deferring execution
    setTimeout(() => {
        loadBarangOptions(selectId, barangId, invId);
        getOptionBrg();
    }, 0);
}

function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}

function pilihInv(id, nomor, supplier) {
    let displayTextNomor = `${nomor}`
    let displayTextSupplier = `${supplier}`

    let hiddenInput = document.getElementById("invId")
    if (hiddenInput) {
        hiddenInput.value = id
        document.getElementById("no_invoice").value = displayTextNomor
        document.getElementById("supplier").value = displayTextSupplier
    }
    closeModalConfirm()
}

async function submitDetail() {
    const id = document.getElementById("hiddenId")?.value
    const barangIds = Array.from(document.querySelectorAll(".barangId")).map(input => parseInt(input.value)).filter(val => !isNaN(val))//filter utk buang null
    const qtyReturs = Array.from(document.querySelectorAll(".input_qtybrg")).map(input => parseInt(input.value)).filter(val => !isNaN(val))//filter utk buang null
    const invId = document.getElementById("invId")?.value
    const bruto = document.getElementById("bruto").value
    const check = await fetch(`/api/detailinvoice/${invId}/`)
    const data = await check.json()

    if (!barangIds || !invId) {
        alert("Barang dan invoice harus dipilih");
        return;
    }

    if (qtyReturs > data.qty_beli) {
        alert("Kuantiti retur melebihi stok beli")
        return
    }

    const method = id ? "PUT" : "POST";
    const apiUrl = id ? `/api/returbeli/${id}/` : `/api/returbeli/`
    const csrfToken = getCSRFToken()
    try {
        const detail_barang = barangIds.map((barangId, index) => ({
            barang: barangId,
            qty: qtyReturs[index]
        }))
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                "invoice_id": invId,
                "subtotal": bruto,
                "detail_barang": detail_barang
            })
        })
        const result = await response.json()
        if (response.ok) {
            console.log("Retur & Detail berhasil disimpan:", result);
            setTimeout(() => {
                location.replace(`/retur/pembelian/`);
            }, 1000);
        } else {
            console.error("Gagal:", result);
            alert("Gagal menyimpan retur: " + JSON.stringify(result));
        }
    } catch (error) {
        console.error("Terjadi kesalahan: ", error)
    }
}

function updateDetailBiaya() {
    let bruto = 0
    const brutoEl = document.getElementById("bruto")
    const ppnInput = document.getElementById("ppn")
    const ongkirInput = document.getElementById("ongkir")
    const discInvInput = document.getElementById("discount")
    const niliaPpnEl = document.getElementById("nilai_ppn")
    const nettoEl = document.getElementById("netto")
    document.querySelectorAll("tr").forEach(row => {
        const inputQty = row.querySelector(".input_qtybrg");
        const inputHarga = row.querySelector(".input_hrgbrg");
        const inputDiskon = row.querySelector(".disc");
        const totalDiscEl = row.querySelector(".totalDisc");
        const totalHargaEl = row.querySelector(".total");
        const barangId = row.querySelector(".barangId")?.value;
        const barangData = window.barangData
        console.log("BarangId:", barangId, "BarangData:", barangData[barangId]);

        if (!barangId || !inputQty || !inputHarga) return;

        const qty = parseInt(inputQty.value) || 0;
        const diskon = parseFloat(inputDiskon.value) || 0;
        const barang = barangData[barangId];

        if (!barang) return;

        let harga = barang.harga_jual;
        if (qty >= barang.min_qty_grosir) {
            harga = barang.harga_satuan;
        } else {
            harga = barang.harga_jual;
        }

        inputHarga.value = harga;

        const totalDiskon = harga * qty * (diskon / 100);
        const totalHarga = harga * qty - totalDiskon;

        totalDiscEl.textContent = "Rp" + totalDiskon.toLocaleString("en-EN") + ",-";
        totalHargaEl.textContent = "Rp" + totalHarga.toLocaleString("en-EN") + ",-";
        bruto += totalHarga
    });
    brutoEl.value = bruto
    const nilaiPpn = bruto * (ppnInput.value / 100)
    const netto = bruto + nilaiPpn + Number(ongkirInput.value) - discInvInput.value

    niliaPpnEl.value = nilaiPpn
    nettoEl.value = netto
}