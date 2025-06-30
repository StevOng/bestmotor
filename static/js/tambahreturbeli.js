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
    input.addEventListener("input", callListener)
})

document.querySelectorAll(".input_qtybrg").forEach(input => {
    input.addEventListener("input", callListener)
})

document.querySelectorAll(".disc").forEach(input => {
    input.addEventListener("input", callListener)
})

document.getElementById("ppn").addEventListener("input", callListener)

document.getElementById("ongkir").addEventListener("input", callListener)

document.getElementById("discount").addEventListener("input", callListener)

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
        loadBarangOptions(select.id, select.value, invId)

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

    newRow.querySelector(".input_hrgbrg").addEventListener("input", callListener)
    newRow.querySelector(".input_qtybrg").addEventListener("input", callListener)
    newRow.querySelector(".disc").addEventListener("input", callListener)
}

function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}

async function pilihInvoice(invoiceId) {
    const response = await fetch(`/api/invoice/${invoiceId}/data/`);
    const data = await response.json();
    const contentType = response.headers.get("content-type");
    console.log("Response content type:", contentType);

    if (!response.ok || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Response bukan JSON:\n", text);
        throw new Error("Bukan response JSON yang valid");
    }

    // Isi field invoice
    document.getElementById("invoiceId").value = invoiceId;
    document.getElementById("no_invoice").value = data.no_invoice;
    document.getElementById("tanggal_inv").value = data.tanggal;
    document.getElementById("no_ref_inv").value = data.no_referensi;
    document.getElementById("top_inv").value = data.top;
    document.getElementById("jatuh_tempo").value = data.jatuh_tempo;
    document.getElementById("bruto").value = data.bruto;
    document.getElementById("netto").value = data.netto;
    document.getElementById("ppn").value = data.ppn;
    document.getElementById("ongkir").value = data.ongkir;
    document.getElementById("discount").value = data.diskon_invoice;

    // Supplier
    document.getElementById("supplierId").value = data.supplier.id;
    document.getElementById("supplier").value = `${data.supplier.perusahaan} - ${data.supplier.nama_sales}`;

    // Render tabel barang
    const tbody = document.querySelector("#detailBrg tbody");
    tbody.innerHTML = "";

    data.barang.forEach((item, index) => {
        tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>
          <input type="hidden" name="barangId" class="barangId" value="${item.barang_id}">
          <select>
            <option selected>${item.kode_barang} - ${item.nama_barang}</option>
          </select>
        </td>
        <td>${item.nama_barang}</td>
        <td><input type="number" value="${item.harga_beli}" class="input_hrgbrg" /></td>
        <td><input type="number" value="${item.qty_beli}" class="input_qtybrg" /></td>
        <td><input type="number" value="${item.diskon_barang}" class="disc" /></td>
        <td class="totalDisc">${item.total_diskon_barang}</td>
        <td class="totalHarga">${item.total_harga_barang}</td>
        <td><button type="button" onclick="submitDetail()" class="btn-submit">💾</button></td>
        <td><button type="button" onclick="confirmPopupBtn(this)">🗑️</button></td>
      </tr>
    `;
    });
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
        showWarningToast("Data Kurang", "Lengkapi data seperti gambar dan invoice")
        return;
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
            showSuccessToast("Berhasil", "Berhasil menyimpan data")
            setTimeout(() => {
                location.replace(`/retur/pembelian/`);
            }, 1000);
        } else {
            console.error("Gagal:", result);
            showWarningToast("Gagal", "Gagal menyimpan data")
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

async function qtyCheck() {
    const invoiceId = document.getElementById("invId")?.value; // pastikan ini tersedia di form
    const isEdit = !!document.getElementById("hiddenId")?.value;
    const rows = document.querySelectorAll("#detailBrg tbody tr");

    for (const row of rows) {
        const inputQty = row.querySelector(".input_qtybrg");
        const rowQty = parseInt(inputQty.value) || 0;
        const rowBarangId = row.querySelector(".barangId").value;
        const dataAwal = parseInt(inputQty.dataset.qtyAwal) || 0;

        try {
            const res = await fetch(`/api/detailinvoice/${rowBarangId}/get_qty_info/?invoice_id=${invoiceId}`);
            if (!res.ok) throw new Error("Gagal mengambil data invoice");
            const data = await res.json();

            const qtyBeli = parseInt(data.qty_beli);
            const qtyRetur = parseInt(data.qty_retur);
            let maxRetur = qtyBeli - qtyRetur;

            if (isEdit) {
                maxRetur += dataAwal;  // tambahkan kembali jika sedang edit
            }

            if (rowQty > maxRetur) {
                showWarningToast("Peringatan Jumlah Retur",
                    `Jumlah retur melebihi pembelian. Maksimum retur yang diizinkan: ${maxRetur}`
                );
                inputQty.value = maxRetur;
                updateDetailBiaya();
            }
        } catch (error) {
            console.error("Gagal memuat data retur invoice:", error);
            showErrorToast("Gagal Memuat Data", "Terjadi kesalahan saat mengambil data retur.");
        }
    }
}

function showWarningToast(head, msg) {
    const toast = document.getElementById("toastWarning");
    const title = document.getElementById("toastWarnHead");
    const paragraph = document.getElementById("toastWarnPar");

    title.innerText = head;
    paragraph.innerText = msg;

    toast.classList.remove("hidden");

    if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

    toast.toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2000);
}

function showSuccessToast(head, msg) {
    const toast = document.getElementById("toastSuccess");
    const title = document.getElementById("toastScs");
    const paragraph = document.getElementById("toastScsp");

    title.innerText = head;
    paragraph.innerText = msg;

    toast.classList.remove("hidden");

    if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

    toast.toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2000);
}

function callListener() {
    minusCheck()
    qtyCheck()
    updateDetailBiaya()
}