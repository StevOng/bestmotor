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
console.log("BarangData global:", window.barangData)

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

$(document).ready(function () {
    let table = $('#modalReturJual').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#returJualSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

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

async function loadBarangOptions(selectId, selectedId = null, fakturId = null) {
    let url = "/api/returjual/barang-dari-faktur/";
    if (url){
        url += `?fakturId=${fakturId}`
    }

    let response = await fetch(url);
    let data = await response.json();

    if (!Array.isArray(data)) {
        console.warn("Data bukan array:", data);
        return; // atau tampilkan warning
    }

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
}

async function getOptionBrg() {
    const selects = document.querySelectorAll("[id^='kodebrg-dropdown-']")
    const fakturId = document.getElementById("fakturId")?.value
    selects.forEach(select => {
        const namaBrgId = select.dataset.namaBarangId
        console.log("selectedId: ", select.id)
        console.log("select value: ", select.value)
        loadBarangOptions(select.id, select.value, fakturId)

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
            // Tambahan pengisian field lainnya (jika ada di API)
            const qtyInput = row.querySelector(".input_qtybrg");
            if (qtyInput && data.qty_retur) {
                qtyInput.value = data.qty_retur;
            }

            const discInput = row.querySelector(".disc");
            if (discInput && data.diskon_barang) {
                discInput.value = data.diskon_barang;
            }

            const totalDiscTd = row.querySelector(".totalDisc");
            if (totalDiscTd && data.total_diskon_barang) {
                totalDiscTd.textContent = data.total_diskon_barang;
            }

            const totalTd = row.querySelector(".total");
            if (totalTd && data.total_harga_barang) {
                totalTd.textContent = data.total_harga_barang;
            }

            updateDetailBiaya();

            // Cek apakah ini baris terakhir → baru tambahkan baris baru
            const allRows = document.querySelectorAll("tbody tr");
            const isLast = row === allRows[allRows.length - 1];
            if (isLast) {
                addNewRow();
            }
        })
    })
}

function addNewRow(re = null) {
    const tbody = document.querySelector("#detailBrg tbody");
    const newRow = document.createElement("tr");
    const rowCount = tbody.querySelectorAll("tr").length + 1;

    const selectId = `kodebrg-dropdown-${rowCount}`;
    const barangId = re?.barang_id || ""
    const fakturId = re?.faktur_id || document.getElementById("fakturId")?.value || ""

    newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td>
          <input type="hidden" name="barangId" class="barangId" value="${barangId}">
          <select id="${selectId}" class="kodebrg-dropdown" data-namaBrg="namaBrg-${rowCount}" data-selected-id="${barangId}">
            <option value="${barangId}" selected>${re?.barang_id.kode_barang || ""} - ${re?.barang_id.nama_barang || ""}</option>
          </select>
        </td>
        <td id="namaBrg-${rowCount}">
          ${re?.barang_id.nama_barang || ""}
        </td>
        <td><input type="number" value="${re?.harga_beli || ""}" id="input_hrgbrg-${rowCount}" class="input_hrgbrg w-full rounded-md border-gray-300" /></td>
        <td><input type="number" value="${re?.qty_retur || ""}" id="input_qtybrg-${rowCount}" class="input_qtybrg w-20 rounded-md border-gray-300" /></td>
        <td><input type="number" value="${re?.diskon_barang || ""}" id="disc-${rowCount}" class="disc w-20 rounded-md border-gray-300" /></td>
        <td class="totalDisc">${re?.total_diskon_barang || ""}</td>
        <td class="total">${re?.total_harga_barang || ""}</td>
        <td class="text-center"><button type="button" onclick="submitDetail()" class="btn-submit"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
        <td class="text-center"><button onclick="hapusRow(this)"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);
    // deferring execution
    setTimeout(() => {
        loadBarangOptions(selectId, barangId, fakturId);
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

function pilihFaktur(id, nomor, cust, pesanan_id) {
    let displayTextNomor = `${nomor}`
    let displayTextSupplier = `${cust}`

    let hiddenInput = document.getElementById("fakturId")
    let hiddenPesananId = document.getElementById("pesananId")
    if (hiddenInput) {
        hiddenInput.value = id
        hiddenPesananId.value = pesanan_id
        document.getElementById("no_faktur").value = displayTextNomor
        document.getElementById("customer").value = displayTextSupplier

        // baru setelah faktur diisi → ambil option barang
        getOptionBrg();
    }
    closeModal()
}

async function submitDetail() {
    const id = document.getElementById("hiddenId")?.value
    const barangIds = Array.from(document.querySelectorAll(".barangId")).map(input => parseInt(input.value)).filter(val => !isNaN(val))//filter utk buang null
    const qtyReturs = Array.from(document.querySelectorAll(".input_qtybrg")).map(input => parseInt(input.value)).filter(val => !isNaN(val))//filter utk buang null
    const fakturId = document.getElementById("fakturId")?.value
    const pesananId = document.getElementById("pesananId")?.value
    const bruto = document.getElementById("bruto").value
    const check = await fetch(`/api/detailpesanan/${pesananId}/`)
    const data = await check.json()

    if (!barangIds || !fakturId) {
        showWarningToast("Data Kurang", "Lengkapi data seperti barang dan faktur")
        return;
    }

    const method = id ? "PATCH" : "POST";
    const apiUrl = id ? `/api/returjual/${id}/` : `/api/returjual/`
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
                "faktur_id": fakturId,
                "subtotal": bruto,
                "detail_barang": detail_barang
            })
        })
        const result = await response.json()
        if (response.ok) {
            console.log("Retur & Detail berhasil disimpan:", result);
            showSuccessToast("Berhasil", "Berhasil menyimpan data")
            setTimeout(() => {
                location.replace(`/retur/penjualan/`);
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
    const niliaPpnEl = document.getElementById("nilai_ppn")
    const nettoEl = document.getElementById("netto")
    console.log("BarangData global:", window.barangData)
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
    const netto = bruto + nilaiPpn + Number(ongkirInput.value)

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
    const pesananId = document.getElementById("pesananId")?.value;
    const isEdit = !!document.getElementById("hiddenId")?.value;
    const rows = document.querySelectorAll("#detailBrg tbody tr");

    for (const row of rows) {
        const inputQty = row.querySelector(".input_qtybrg");
        const rowQty = parseInt(inputQty.value) || 0;
        const rowBarangId = row.querySelector(".barangId").value;
        const dataAwal = parseInt(inputQty.dataset.qtyAwal) || 0;

        if (!rowBarangId || !pesananId) {
            console.warn("Lewati baris karena barangId atau pesananId kosong:", rowBarangId, pesananId);
            continue;
        }

        try {
            const res = await fetch(`/api/detailpesanan/retur_info/?pesanan_id=${pesananId}&barang_id=${rowBarangId}`);
            if (!res.ok) throw new Error("Gagal fetch retur info");

            const data = await res.json();
            const qtyPesan = parseInt(data.qty_pesan);
            const qtyRetur = parseInt(data.qty_retur);
            let maxRetur = qtyPesan - qtyRetur;

            if (isEdit) {
                maxRetur += dataAwal;
            }

            if (rowQty > maxRetur) {
                showWarningToast("Peringatan Retur", `Maksimum retur yang diizinkan: ${maxRetur}`);
                inputQty.value = maxRetur;
                updateDetailBiaya();
            }
        } catch (err) {
            console.error("Gagal ambil info retur:", err);
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