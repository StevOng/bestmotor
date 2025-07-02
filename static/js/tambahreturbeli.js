document.addEventListener('DOMContentLoaded', () => {
    const tanggal = document.getElementById("tanggal_inv")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate

    setTimeout(() => {
        if (window.barangData && Object.keys(window.barangData).length > 0) {
            updateDetailBiaya();
        } else {
            console.warn("BarangData masih kosong, perhitungan ditunda.");
        }
    }, 300);
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
    modal.classList.remove("none"); // Pastikan modal benar-benar hilang
}

async function loadBarangOptions(selectId, selectedId = null, invId = null) {
    let url = "/api/returbeli/";
    if (invId) {
        url += `?invId=${invId}`;
    }

    let response = await fetch(url);
    let data = await response.json();

    if (!window.barangData) {
        window.barangData = {};
    }

    data.forEach(barang => {
        window.barangData[barang.id] = barang;  // penting
    });

    let select = document.getElementById(selectId);
    select.innerHTML = "<option disabled selected>Pilih Barang</option>";

    data.forEach(barang => {
        let option = document.createElement("option");
        option.value = barang.id;
        option.text = barang.kode_barang + "-" + barang.nama_barang;
        if (barang.id == selectedId) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    return data;
}

async function getOptionBrg() {
    const selects = document.querySelectorAll("[id^='kodebrg-dropdown-']")
    const invId = document.getElementById("invId")?.value

    // 1. Ambil semua value yang sudah dipilih
    const selectedBarangIds = Array.from(selects)
        .map(s => s.value)
        .filter(val => val !== "");

    for (const select of selects) {
        const selectedId = select.dataset.selectedId;
        const namaBrgId = select.dataset.namaBarangId;

        // 1. Load ulang option untuk dropdown ini
        await loadBarangOptions(select.id, selectedId || select.value, invId);

        // 2. Disable option yang sudah dipilih di dropdown lain
        const currentValue = select.value;
        Array.from(select.options).forEach(option => {
            if (option.value === "" || option.value === currentValue) {
                option.disabled = false;
            } else {
                option.disabled = selectedBarangIds.includes(option.value);
            }
        });

        // 3. Tambah event listener satu kali
        if (!select.dataset.listenerAttached) {
            select.addEventListener("change", async () => {
                const barangId = select.value;
                const row = select.closest("tr");
                const hiddenInput = row.querySelector(".barangId");
                if (hiddenInput) {
                    hiddenInput.value = barangId;
                }

                const response = await fetch(`/api/detailinvoice/by_invoice/${invId}/${barangId}/`);
                const data = await response.json();

                const namaBrgEl = document.getElementById(namaBrgId);
                if (namaBrgEl && data.nama_barang) {
                    namaBrgEl.textContent = data.nama_barang;
                }

                const hargaInput = row.querySelector(".input_hrgbrg");
                if (hargaInput) {
                    hargaInput.value = data.harga_jual;
                }

                const diskonInput = row.querySelector(".disc");
                if (diskonInput && data.diskon_barang !== undefined) {
                    diskonInput.value = data.diskon_barang;
                }

                updateDetailBiaya();

                // Tambah baris baru jika ini baris terakhir
                const allRows = document.querySelectorAll("tbody tr");
                const isLast = row === allRows[allRows.length - 1];
                if (isLast) {
                    addNewRow();
                }

                // Panggil ulang untuk update disable
                getOptionBrg();
            });

            select.dataset.listenerAttached = "true";
        }
    }
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
          <select id="${selectId}" class="kodebrg-dropdown" data-nama-barang-id="namaBrg-${rowCount}" data-selected-id="${barangId}">
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

function pilihInvoice(id, nomor, supplier, ppn) {
    let displayTextNomor = `${nomor}`;
    let displayTextSupplier = `${supplier}`;
    let displayPpn = `${ppn}`;

    let hiddenInput = document.getElementById("invId");

    if (hiddenInput) {
        hiddenInput.value = id;

        // Isi input tampilan
        document.getElementById("no_invoice").value = displayTextNomor;
        document.getElementById("supplier").value = displayTextSupplier;
        document.getElementById("ppn").value = displayPpn;

        // Setelah invoice diisi → ambil pilihan barang yang tersedia
        getOptionBrg(); 
    }

    closeModal();
}


async function submitDetail() {
    const id = document.getElementById("hiddenId")?.value
    const barangIds = Array.from(document.querySelectorAll(".barangId")).map(input => parseInt(input.value)).filter(val => !isNaN(val))//filter utk buang null
    const qtyReturs = Array.from(document.querySelectorAll(".input_qtybrg")).map(input => parseInt(input.value)).filter(val => !isNaN(val))//filter utk buang null
    const diskonBrgs = Array.from(document.querySelectorAll(".disc")).map(input => parseInt(input.value)).filter(val => !isNaN(val))//filter utk buang null
    const invId = document.getElementById("invId")?.value
    const bruto = document.getElementById("bruto").value
    const ongkir = document.getElementById("ongkir")?.value
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
            qty: qtyReturs[index],
            diskon_barang: diskonBrgs[index]
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
                "ongkir": ongkir,
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
    const netto = bruto + nilaiPpn

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

        if (!rowBarangId || !invoiceId) {
            console.warn("Lewati baris karena barangId atau invoiceId kosong:", rowBarangId, invoiceId);
            continue;
        }

        try {
            const res = await fetch(`/api/detailinvoice/get_qty_info/?invoice_id=${invoiceId}&barang_id=${rowBarangId}`);
            if (!res.ok) throw new Error("Gagal mengambil data invoice");
            const data = await res.json();

            const qtyBeli = parseInt(data.qty_beli);
            const stokBarang = parseInt(data.stok_barang);
            let maxRetur = qtyBeli;
            console.log(data);
            console.log(stokBarang);

            if (isEdit) {
                maxRetur += dataAwal;  // tambahkan kembali jika sedang edit
            }

            if (rowQty > stokBarang) {
                showWarningToast("Stok Tidak Cukup", `Stok barang tersisa hanya ${stokBarang}.`);
                inputQty.value = stokBarang;
                updateDetailBiaya();
                continue;
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
    qtyCheck()
    updateDetailBiaya()
}