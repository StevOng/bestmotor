document.addEventListener('DOMContentLoaded', () => {
    getKurir()
    getOptionBrg()
    updateDetailBiaya()

    const tanggal = document.getElementById("tanggal")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate

    // document.querySelectorAll(".input_qtybrg").forEach(qtyEl => {
    //     qtyEl.dispatchEvent(new Event("input"));
    // });
})
console.log("BarangData global:", window.barangData)

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

$(document).ready(function () {
    $('#detailBrg').DataTable({
        pageLength: 20,
        lengthChange: false,
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

document.getElementById("top").addEventListener("input", callListener)

function tanggalTop() {
    const topInput = document.getElementById("top")
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
    let table = $('#modalCustomer').DataTable({
        pageLength: 5,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] } // kolom 8 dan 9 di tengah
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#customerSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

document.getElementById("toggleCheck")?.addEventListener("click", function () {
    document.getElementById("checkIcon").classList.toggle("hidden");
});

function confirmPopupBtn(attr) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
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

// update harga secara dinamis
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
        const totalHargaEl = row.querySelector(".totalHarga");
        const barangId = row.querySelector(".barangId")?.value;
        const barangData = window.barangData
        console.log("BarangId:", barangId, "BarangData:", barangData[barangId]);

        if (!barangId || !inputQty || !inputHarga) return;

        const qty = parseInt(inputQty.value) || 0;
        const diskon = parseFloat(inputDiskon.value) || 0;
        const barang = barangData[barangId];

        if (!barang) return;

        let harga = barang.harga_jual;
        barang.tier_harga.forEach(tier => {
            if (qty >= tier.min_qty_grosir) {
                harga = tier.harga_satuan
            }
        })
        inputHarga.value = harga;

        const totalDiskon = harga * qty * (diskon / 100);
        const totalHarga = harga * qty - totalDiskon;

        totalDiscEl.textContent = "Rp " + totalDiskon.toLocaleString('en-US') + ",-";
        totalHargaEl.textContent = "Rp " + totalHarga.toLocaleString('en-US') + ",-";
        bruto += totalHarga
    });
    brutoEl.value = bruto
    const nilaiPpn = bruto * (ppnInput.value / 100)
    const netto = bruto + nilaiPpn + Number(ongkirInput.value) - discInvInput.value

    niliaPpnEl.value = nilaiPpn
    nettoEl.value = netto
}

async function getKurir() {
    try {
        let response = await fetch('/api/pesanan/kurir_choices/')
        let choices = await response.json()

        let select = document.getElementById("kurir")
        let selectedKurir = select.dataset.selectedKurir

        choices.forEach(choice => {
            let option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label
            select.appendChild(option)
        })
        if (selectedKurir) {
            select.value = selectedKurir
        }
    } catch (error) {
        console.error(error);
    }
}

function pilihCustomer(id, nama, toko) {
    let displayText = `${toko} - ${nama}`

    document.getElementById("customer").value = displayText

    let hiddenInput = document.getElementById("customerId")
    if (hiddenInput) {
        hiddenInput.value = id
    }
    console.log(`id customer yang dipilih: ${hiddenInput.value} atau ${id}`)
    closeModal()
}

async function submitDetail() {
    const id = document.getElementById("pesananId")?.value
    const qtys = Array.from(document.querySelectorAll(".input_qtybrg")).map(input => parseInt(input.value)).filter(val => !isNaN(val))
    const diskonBarangs = Array.from(document.querySelectorAll(".disc")).map(input => parseFloat(input.value)).filter(val => !isNaN(val))
    const barangIds = Array.from(document.querySelectorAll(".barangId")).map(input => parseInt(input.value)).filter(val => !isNaN(val))
    const kurir = document.getElementById("kurir").value
    const noRef = document.getElementById("no_referensi").value
    const customer = document.getElementById("customerId").value
    const top = document.getElementById("top").value
    const alamat = document.getElementById("alamat_kirim").value
    const keterangan = document.getElementById("keterangan").value
    const ppn = document.getElementById("ppn").value
    const ongkir = document.getElementById("ongkir").value
    const diskon = document.getElementById("discount").value

    if (!customer || !barangIds) {
        const headWarn = "Peringatan Data Penting"
        const parWarn = "Customer dan Barang harus dipilih"
        showWarningToast(headWarn, parWarn)
        console.log(`customerId: ${customer}, barangId: ${barangIds}`)
        return
    }
    const method = id ? "PUT" : "POST";
    const apiUrl = id ? `/api/pesanan/${id}/` : `/api/pesanan/`
    const csrfToken = getCSRFToken()
    try {
        const detail_barang = barangIds.map((barangId, index) => ({
            barang_id: barangId,
            qty_pesan: qtys[index],
            diskon_barang: diskonBarangs[index]
        }))
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                "customer_id": customer,
                "no_referensi": noRef,
                "kurir": kurir,
                "top": top,
                "ppn": ppn,
                "ongkir": ongkir,
                "diskon_pesanan": diskon,
                "alamat_kirim": alamat,
                "keterangan": keterangan,
                "detail_barang": detail_barang
            })
        })
        const result = await response.json()
        if (response.ok) {
            console.log("Pesanan & Detail berhasil disimpan:", result);
            const headScs = "Berhasil"
            const parScs = "Data berhasil ditambah"
            showSuccessToast(headScs, parScs)
            setTimeout(() => {
                location.replace(`/pesanan/`);
            }, 1000);
        } else {
            console.error("Gagal:", result);
            const headWarn = "Gagal Melakukan Aksi"
            const parWarn = "Terjadi kesalahan dalam menyimpan pesanan"
            showWarningToast(headWarn, parWarn)
            console.log(`Customer ID: ${customer}`)
        }
    } catch (error) {
        console.error("Terjadi kesalahan: ", error)
    }
}

async function loadBarangOptions(selectId, selectedId) {
    let response = await fetch("/api/barang/")
    let data = await response.json()
    let select = document.getElementById(selectId)

    select.innerHTML = "<option disabled selected>Pilih Barang</option>"

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
    // Ambil semua ID barang yang sedang dipilih (kecuali kosong)
    const selectedBarangIds = Array.from(selects)
        .map(s => s.value)
        .filter(val => val !== "");

    selects.forEach(select => {
        const namaBrgId = select.dataset.namaBarangId
        const currentValue = select.value

        // Load ulang options untuk dropdown ini
        loadBarangOptions(select.id, currentValue).then(() => {
            // Setelah options dimuat, disable yang sudah dipilih di dropdown lain
            Array.from(select.options).forEach(option => {
                if (option.value === "" || option.value === currentValue) {
                    option.disabled = false;
                } else {
                    option.disabled = selectedBarangIds.includes(option.value);
                }
            });
        });

        // Hindari penambahan event listener berkali-kali
        if (!select.dataset.listenerAttached) {
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

                // Tambahkan baris baru jika ini baris terakhir
                const allRows = document.querySelectorAll("tbody tr");
                const isLast = row === allRows[allRows.length - 1];
                if (isLast) {
                    addNewRow();
                }

                // Panggil ulang untuk update disable option
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

    newRow.classList.add("new-row-added");
    newRow.innerHTML = `
      <td>${rowCount}</td>
      <td>
        <input type="hidden" name="barangId-${rowCount}" class="barangId" value="${barangId}">
        <select id="${selectId}" class="kodebrg-dropdown" data-nama-barang-id="namaBrg-${rowCount}">
          <option value="${barangId}">Pilih Barang</option>
        </select>
      </td>
      <td id="namaBrg-${rowCount}">${detail?.barang_id?.nama_barang || ""}</td>
      <td><input type="number" value="${detail?.barang_id?.harga_jual || 0}" class="input_hrgbrg rounded-md border-gray-300"/></td>
      <td><input type="number" value="${detail?.qty_pesan || 0}" class="input_qtybrg w-20 rounded-md border-gray-300"/></td>
      <td><input type="number" value="${detail?.diskon_barang || 0}" class="disc w-20 rounded-md border-gray-300"/></td>
      <td class="totalDisc">${detail?.total_diskon_barang || ""}</td>
      <td class="totalHarga">${detail?.total_harga_barang || ""}</td>
      <td class="text-center"><button type="button" onclick="submitDetail()" class="btn-submit"><i class="btn-simpan fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
      <td class="text-center"><button type="button" onclick="hapusRow(this)" class="btn-hapus"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
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

function qtyCheck() {
    const id = document.getElementById("pesananId")?.value
    console.log(`id: ${id}`)
    const row = document.querySelectorAll("#detailBrg tbody tr")
    row.forEach(async (input) => {
        const inputQty = input.querySelector(".input_qtybrg")
        const rowQty = inputQty.value
        const rowId = input.querySelector(".barangId").value
        const dataAwal = parseInt(inputQty.dataset.qtyAwal)
        const data = await fetch(`/api/barang/${rowId}/`)
        const res = await data.json()

        if (!id) {
            if (rowQty > res.stok) {
                const headWarn = "Peringatan Stok Kurang"
                const parWarn = `Stok tidak mencukupi untuk pesanan, sisa stok tinggal ${res.stok}`
                showWarningToast(headWarn, parWarn)
                inputQty.value = res.stok
                updateDetailBiaya()
                return
            }
        } else {
            const balikStok = res.stok + dataAwal
            console.log(`stok: ${balikStok}`)
            if (rowQty > balikStok) {
                const headWarn = "Peringatan Stok Kurang"
                const parWarn = `Stok tidak mencukupi untuk pesanan, sisa stok tinggal ${balikStok}`
                showWarningToast(headWarn, parWarn)
                inputQty.value = balikStok
                updateDetailBiaya()
                return
            }
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

    toast.innerHTML = `
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
    tanggalTop()
}