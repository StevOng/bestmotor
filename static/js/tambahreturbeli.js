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

document.getElementById("ppn").addEventListener("input", updateDetailBiaya)

document.getElementById("ongkir").addEventListener("input", updateDetailBiaya)

document.getElementById("discount").addEventListener("input", updateDetailBiaya)

function confirmPopupBtn(returId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = () => {
        const row = document.querySelector(`tr[data-id=${returId}]`)
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

async function loadBarangOptions(selectId, selectedId = null) {
    let response = await fetch("/api/barang/")
    let data = await response.json()
    let select = document.getElementById(selectId)
    select.innerHTML = "<option disabled selected>Kode</option>"

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
        const namaBrgId = select.dataset.namaBrg
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
          <input type="hidden" name="barangId" class="barangId" value="${inv?.barang_id||""}">
          <select id="kodebrg-dropdown-${rowCount}" class="kodebrg-dropdown" data-namaBrg="namaBrg-${rowCount}" data-selected-id="${inv?.barang_id||""}">
            <option value="${inv?.barang_id||""}" selected>${inv?.barang_id.kode_barang||""} - ${inv?.barang_id.nama_barang||""}</option>
          </select>
        </td>
        <td id="namaBrg-${rowCount}">
          ${inv?.barang_id.nama_barang||""}
        </td>
        <td><input type="number" value="${inv?.harga_beli||""}" id="input_hrgbrg-${rowCount}" class="input_hrgbrg w-full rounded-md border-gray-300" /></td>
        <td><input type="number" value="${inv?.qty_retur||""}" id="input_qtybrg-${rowCount}" class="input_qtybrg w-20 rounded-md border-gray-300" /></td>
        <td><input type="number" value="${inv?.diskon_barang||""}" id="disc-${rowCount}" class="disc w-20 rounded-md border-gray-300" /></td>
        <td class="totalDisc">${inv?.total_diskon_barang||""}</td>
        <td class="total">${inv?.total_harga_barang||""}</td>
        <td><button type="submit" data-id=""><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
        <td><button onclick="hapusRow(this)"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);

    const btnSubmit = newRow.querySelector(".btn-submit")
    if (inv?.id) {
        btnSubmit.setAttribute("data-id", inv.id)
    }

    loadBarangOptions(`kodebrg-dropdown-${rowCount}`, inv?.barang_id || null);
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

document.querySelectorAll(".btn-submit").forEach((btn) => {
    btn.addEventListener("submit", async (event) => {
        event.preventDefault();

        const row = btn.closest("tr")
        const barangId = row.querySelector(".barangId").value
        const qtyRetur = row.querySelector("[id^='input_qtybrg-']").value
        const hrgBrg = row.querySelector("[id^='input_hrgbrg-']").value
        const disc = row.querySelector("[id^='disc-']").value
        const id = document.getElementById("hiddenId").value
        const invId = document.getElementById("invId").value
        const bruto = document.getElementById("bruto").value
        const ongkir = document.getElementById("ongkir").value
        const ppn = document.getElementById("ppn").value
        const discount = document.getElementById("discount").value
        const nilaiPpn = ppn * ((qtyRetur * hrgBrg) - disc)
        const check = await fetch(`/api/detailinvoice/${invId}/`)
        const data = await check.json()

        if (!barangId || !invId) {
            alert("Barang dan invoice harus dipilih");
            return;
        }

        if (qtyRetur > data.qty_beli) {
            alert("Kuantiti retur melebihi stok beli")
            return
        }

        const retur = new FormData()
        retur.append("invoice_id", invId)
        retur.append("subtotal", bruto)

        const method = id ? "PATCH" : "POST";
        const apiUrl = id ? `/api/returbeli/${id}/`:`/api/returbeli/`
        try {
            const response = await fetch(apiUrl, {
            method: method,
            body: retur
            })
            if (response.ok) {
                const patchInv = await fetch(`/api/invoice/${invId}/`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        bruto: (qtyRetur * hrgBrg),
                        nilai_ppn: nilaiPpn,
                        netto: bruto + nilaiPpn + ongkir - discount,
                    })
                }) 
                const patchDetail = await fetch(`/api/detailinvoice/${invId}/`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        qty_retur: qtyRetur
                    })
                })
                if (patchInv.ok && patchDetail.ok) {
                    const response1 = await patchInv.json()
                    const response2 = await patchDetail.json()
                    console.log(response1, response2);
                } else {
                    console.log("Terjadi kesalahan saat PATCH invoice detailinvoice")
                }
            } else {
                console.log(`Gagal ${method} ke ${apiUrl}`)
            }
        } catch (error) {
            console.error("Terjadi kesalahan: ", error)
        }
    });
});

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

        if (!barangId || !inputQty || !inputHarga) return;

        const updateHarga = () => {
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

            totalDiscEl.textContent = totalDiskon.toFixed(2);
            totalHargaEl.textContent = totalHarga.toFixed(2);
            bruto += totalHarga
        };

        inputQty.addEventListener("input", updateHarga);
        inputDiskon.addEventListener("input", updateHarga);
    });
    brutoEl.value = bruto
    const nilaiPpn = bruto * (ppnInput.value / 100)
    const netto = bruto + nilaiPpn + Number(ongkirInput.value) - discInvInput.value

    niliaPpnEl.value = nilaiPpn
    nettoEl.value = netto
}