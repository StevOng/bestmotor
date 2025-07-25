document.addEventListener('DOMContentLoaded', function (e) {
    e.preventDefault()
    getOptionBrg()
    updateDetailBiaya()
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

document.getElementById("top_inv").addEventListener("input", callListener)

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
        pageLength: 5,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
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
            const toClear = [2,6,7]
            if (toClear.includes(i)) {
                td.textContent = ""
            }
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
    // Ambil semua value barang yang sudah dipilih (selain kosong)
    const selectedBarangIds = Array.from(selects)
        .map(s => s.value)
        .filter(val => val !== "");

    selects.forEach(select => {
        const namaBrgId = select.dataset.namaBarangId;
        const currentValue = select.value;

        loadBarangOptions(select.id, currentValue).then(() => {
            Array.from(select.options).forEach(option => {
                if (option.value === "" || option.value === currentValue) {
                    option.disabled = false;
                } else {
                    option.disabled = selectedBarangIds.includes(option.value);
                }
            });
        });

        if (!select.dataset.listenerAttached) {
            select.addEventListener("change", async () => {
                const barangId = select.value;
                const row = select.closest("tr");
                let hiddenInput = row.querySelector(".barangId");
                if (hiddenInput) {
                    hiddenInput.value = barangId;
                }

                const response = await fetch(`/api/barang/${barangId}/`);
                const data = await response.json();

                const namaBrgEl = document.getElementById(namaBrgId);
                if (namaBrgEl && data.nama_barang) {
                    namaBrgEl.textContent = data.nama_barang;
                }

                const hargaInput = row.querySelector(".input_hrgbrg");
                if (hargaInput) {
                    hargaInput.value = data.harga_modal;
                }

                updateDetailBiaya();

                const allRows = document.querySelectorAll("tbody tr");
                const isLast = row === allRows[allRows.length - 1];
                if (isLast) {
                    addNewRow();
                }

                getOptionBrg();
            });

            select.dataset.listenerAttached = "true";
        }
    });
}

function addNewRow(detail = null) {
    const tbody = document.querySelector("#detailBrg tbody");
    const newRow = document.createElement("tr");
    const rowCount = tbody.querySelectorAll("tr").length + 1;

    const selectId = `kodebrg-dropdown-${rowCount}`;
    const barangId = detail?.barang_id?.id || ""

    newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td>
          <input type="hidden" name="barangId-${rowCount}" class="barangId" value="${barangId}">
          <select id="${selectId}" class="kodebrg-dropdown" data-nama-barang-id="namaBrg-${rowCount}">
            <option value="${barangId}">Kode</option>
          </select>
        </td>
        <td id="namaBrg-${rowCount}">${detail?.barang_id?.nama_barang || ""}</td>
        <td><input type="number" value="${detail?.harga_beli || 0}" id="input_hrgbrg-${rowCount}" class="input_hrgbrg w-full rounded-md border-gray-300" /></td>
        <td><input type="number" value="${detail?.qty_beli || 0}" id="input_qtybrg-${rowCount}" class="input_qtybrg w-20 rounded-md border-gray-300" /></td>
        <td><input type="number" value="${detail?.diskon_barang || 0}" id="disc-${rowCount}" class="disc w-20 rounded-md border-gray-300" /></td>
        <td class="totalDisc">${detail?.total_diskon_barang || ""}</td>
        <td class="totalHarga">${detail?.total_harga_barang || ""}</td>
        <td class="text-center"><button type="button" onclick="submitDetail()" class="btn-submit"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
        <td class="text-center"><button type="button" onclick="hapusRow(this)"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);

    // deferring execution
    setTimeout(() => {
        loadBarangOptions(selectId, barangId);
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
    const noRef = document.getElementById("no_ref_inv").value
    const tanggal = document.getElementById("tanggal_inv").value
    const top = document.getElementById("top_inv").value
    const ppn = document.getElementById("ppn").value
    const ongkir = document.getElementById("ongkir").value
    const diskon = document.getElementById("discount").value
    const netto = document.getElementById("netto").value
    console.log("Nilai supplierId sebelum submit:", supplier)

    if (!supplier || barangIds.length == 0) {
        console.log("supplier:",supplier,"barang:", barangIds)
        console.log(id)
        showWarningToast("Data Kurang", "Lengkapi data seperti supplier dan barang")
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
                "no_referensi": noRef,
                "tanggal": tanggal,
                "top": top,
                "ppn": ppn,
                "ongkir": ongkir,
                "diskon_invoice": diskon,
                "detail_barang": detail_barang,
                "sisa_bayar": netto,
            })
        })
        const result = await response.json()
        if (response.ok) {
            console.log("Invoice & Detail berhasil disimpan:", result);
            showSuccessToast("Berhasil", "Berhasil menyimpan data")
            setTimeout(() => {
                location.replace(`/pembelian/invoice/`);
            }, 1000);
        } else {
            console.error("Gagal:", result);
            showWarningToast("Gagal", "Gagal menyimpan data")
            console.log(`tanggal val: ${tanggal}`)
            console.log("supplierID: ", supplier)
        }
    } catch (error) {
        console.error("Terjadi kesalahan: ", error)
        showWarningToast("Gagal", "Terjadi kesalahan")
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

        totalDiscEl.textContent = "Rp " + totalDiscBrg.toLocaleString("en-EN") + ",-"
        totalHargaEl.textContent = "Rp " + totalNilaiBrg.toLocaleString("en-EN") + ",-"
        bruto += totalNilaiBrg
    })
    brutoEl.value = bruto
    const nilaiPpn = bruto * (ppnInput.value / 100)
    const netto = bruto + nilaiPpn + Number(ongkirInput.value) - discInvInput.value

    niliaPpnEl.value = nilaiPpn
    nettoEl.value = parseInt(netto)
}

function minusCheck() {
    const allInput = document.querySelectorAll("input")
    allInput.forEach(input => {
        if (input.type == "number" && input.value < 0) {
            showWarningToast("Nilai Minus", "Isi harga, kuantiti dan diskon tidak boleh minus")
            input.value = null
            updateDetailBiaya()
            return
        }
    })
}

function qtyCheck() {
    const id = document.getElementById("invoiceId")?.value
    console.log(`id: ${id}`)
    const row = document.querySelectorAll("#detailBrg tbody tr")
    row.forEach(async (input) => {
        const inputQty = input.querySelector(".input_qtybrg")
        const rowQty = inputQty.value
        const rowId = input.querySelector(".barangId").value
        const dataAwal = parseInt(inputQty.dataset.qtyAwal)
        const data = await fetch(`/api/barang/${rowId}/`)
        const res = await data.json()

        if (rowQty > res.qty_beli) {
            const headWarn = "Peringatan Stok Kurang"
            const parWarn = `Stok beli tidak mencukupi, sisa stok yang dibeli tinggal ${res.qty_beli}`
            showWarningToast(headWarn, parWarn)
            inputQty.value = res.qty_beli
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
    // qtyCheck()
    updateDetailBiaya()
    tanggalTop()
}