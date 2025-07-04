document.addEventListener('DOMContentLoaded', () => {

    const tanggal = document.getElementById("tgl_byrhutang")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate

    let sumFaktur = 0
    document.querySelectorAll("[id^='nilaiFaktur-']").forEach(cell => {
        // buang semua non-digit dari teks, parse jadi angka
        const num = parseInt(cell.textContent.replace(/[^\d]/g, ''), 10) || 0
        sumFaktur += num
    })
    const hiddenId = document.getElementById("piutangId")
    if (!hiddenId) {
        document.getElementById("tot_faktur").value = formatRupiah(sumFaktur)
    }

    // — hitung Total Potongan & Pelunasan awalnya juga —
    totalPotongan()
    totalPelunasan()
})

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

$(document).ready(function () {
    window.piutangTable = $("#allpesanan").DataTable({
        paging: false,
        lengthChange: false,
        ordering: false,
        scrollX: true,
        info: false,
        searching: false,
        language: {
            emptyTable: "Tidak ada data faktur."
        }
    });
    $(".dt-search").remove();
    $(".dt-info").remove();
});

const ptgn = document.querySelectorAll(".potongan")
ptgn.forEach(input => input.addEventListener("input", callListener))
const nbyr = document.querySelectorAll(".nilaiByr")
nbyr.forEach(input => input.addEventListener("input", callListener))

//PopupModal Customer
window.openModalSales = function () {
    const modal = document.getElementById("popupModalSales");
    modal.classList.replace("hidden", "flex");
};
window.closeModalSales = function () {
    const modal = document.getElementById("popupModalSales");
    modal.classList.replace("flex", "hidden");
};

$(document).ready(function () {
    let table = $('#modalSales').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#salesSearch').on('keyup', function () {
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

let currentFakturRow = null;

function openModalFaktur(button) {
    currentFakturRow = button.closest("tr");
    document.getElementById("popupModalFaktur")
        .classList.replace("hidden", "flex");
}

function closeModalFaktur() {
    document.getElementById("popupModalFaktur")
        .classList.replace("flex", "hidden");
}

$(document).ready(function () {
    let table = $('#modalFaktur').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#fakturSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

function openModalCustomer() {
    let modal = document.getElementById("popupModalFaktur");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModalCustomer() {
    let modal = document.getElementById("popupModalFaktur");
    modal.classList.remove("flex");
    modal.classList.add("hidden");
}

$(document).ready(function () {
    let table = $('#modalCustomer').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#customerSearch').on('keyup', function () { //search
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
            if (i == 2 && i == 3) td.textContent = ""
        })
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}

function pilihSales(id, nama) {
    document.getElementById("salesId").value = id;
    document.getElementById("sales").value = nama;
    closeModalSales();
    fetchFakturBySales(id);
}

async function fetchFakturBySales(salesId) {
    const res = await fetch(`/api/faktur/by_sales/${salesId}/`);
    const fakturList = await res.json();

    const tbody = document.querySelector("#modalFaktur tbody");
    tbody.innerHTML = "";
    fakturList.forEach(faktur => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${faktur.no_faktur}</td>
      <td>${faktur.tanggal_faktur}</td>
      <td>${faktur.no_referensi}</td>
      <td>${faktur.customer}</td>
      <td>${formatRupiah(faktur.total)}</td>
      <td class="text-center">
        <button onclick="pilihFaktur('${faktur.id}','${faktur.no_faktur}', '${faktur.customer_id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
              <path d="M9.72217 11L12.7222 14L22.7222 4M16.7222 3H8.52217C6.84201 3 6.00193 3 5.3602 3.32698C4.79571 3.6146 4.33677 4.07354 4.04915 4.63803C3.72217 5.27976 3.72217 6.11984 3.72217 7.8V16.2C3.72217 17.8802 3.72217 18.7202 4.04915 19.362C4.33677 19.9265 4.79571 20.3854 5.3602 20.673C6.00193 21 6.84201 21 8.52217 21H16.9222C18.6023 21 19.4424 21 20.0841 20.673C20.6486 20.3854 21.1076 19.9265 21.3952 19.362C21.7222 18.7202 21.7222 17.8802 21.7222 16.2V12" stroke="#3D5A80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

async function pilihFaktur(id, noFaktur, custIdValue) {
    // 1) only touch the row you originally opened the modal from:
    const row = currentFakturRow;
    const hiddenFaktur = row.querySelector("input.fakturId");
    const txtNo = row.querySelector("input.noFaktur");
    const nilaiCell = row.querySelector("td.nilaiCell");
    const inputCust = document.getElementById("custId");
    const inputSales = document.getElementById("salesId");

    // 2) fetch the full faktur data
    const res = await fetch(`/api/faktur/${id}/?format=json`, {
        headers: { Accept: "application/json" }
    });
    const data = await res.json();

    // 3) fill only that one row + summary fields
    hiddenFaktur.value = id
    txtNo.value = data.no_faktur;
    nilaiCell.textContent = formatRupiah(data.total);
    inputCust.value = custIdValue;     // from your button’s 3rd arg

    recalcTotals();  // update your three summary boxes

    // 4) if you’re on the last row *and* you just populated it, make a fresh blank row
    const allRows = Array.from(
        document.querySelectorAll("#allpesanan tbody tr")
    );
    if (row === allRows[allRows.length - 1]) {
        addNewRow();   // no args: it will render an empty row
    }

    closeModalFaktur();
}

async function submitDetail() {
    const piutangId = document.getElementById("piutangId")?.value;
    const custId = document.getElementById("custId").value;
    const salesId = document.getElementById("salesId").value;

    // gather per-row payloads
    const detailRows = Array.from(
        document.querySelectorAll("#allpesanan tbody tr")
    ).map(tr => {
        const fid = parseInt(tr.querySelector(".fakturId").value, 10);
        const bayar = parseFloat(tr.querySelector(".nilaiByr").value) || 0;
        const potong = parseFloat(tr.querySelector(".potongan").value) || 0;
        return { faktur: fid, nilai_bayar: bayar, potongan: potong };
    }).filter(r => r.faktur); // drop any still-empty rows

    if (!custId || !salesId || detailRows.length === 0) {
        return showWarningToast("Data Kurang",
            "Pastikan Anda memilih Sales, Customer, dan setidaknya satu Faktur.");
    }

    const url = piutangId
        ? `/api/piutang/${piutangId}/`
        : `/api/piutang/`;
    const method = piutangId ? "PUT" : "POST";

    const body = {
        customer_id: custId,
        sales_id: salesId,
        list_faktur: detailRows
    };

    const res = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            'Accept': 'application/json',
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) {
        const err = await res.text()
        console.error("Gagal simpan piutang:", err);
        return showWarningToast("Error Simpan",
            (data.detail || "Periksa console untuk detail."));
    }

    showSuccessToast("Berhasil", "Pembayaran piutang tersimpan");
    setTimeout(() => location.replace("/penjualan/pembayaran/piutang/"), 1000);
}

function totalPotongan() {
    const potongan = document.querySelectorAll('.potongan')
    let total = 0

    potongan.forEach(p => {
        total += parseFloat(p.value) || 0
    })

    document.getElementById("tot_pot").value = total
}

function totalPelunasan() {
    const bayar = document.querySelectorAll(".nilaiByr")
    let total = 0

    bayar.forEach(b => {
        total += parseFloat(b.value) || 0
    })

    document.getElementById("tot_lunas").value = total
}

function formatRupiah(angka) {
    if (isNaN(angka)) return "";
    angka = Math.floor(angka);
    return angka.toLocaleString("en-EN");
}

function addNewRow() {
    const tbody = document.querySelector("#allpesanan tbody");
    // if there’s exactly one row and it’s still blank, don’t duplicate it
    if (tbody.children.length === 1) {
        const onlyHidden = tbody.querySelector("input.fakturId").value === "";
        if (onlyHidden) return;
    }

    const rowNum = tbody.children.length + 1;
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td>${rowNum}</td>
    <td>
      <div class="relative mt-1">
        <input type="hidden" class="fakturId" value="">
        <input type="text" class="noFaktur mt-1 block w-36 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-customBlue focus:border-customBlue" value="" placeholder="Pilih Faktur" disabled>
        <button type="button" onclick="openModalFaktur(this)"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </td>
    <td class="nilaiCell">Rp 0,-</td>
    <td><input type="number" class="potongan w-full rounded-md border-gray-300" value="0"></td>
    <td><input type="number" class="nilaiByr w-full rounded-md border-gray-300" value="0"></td>
    <td class="text-center">
      <button type="button" onclick="submitDetail()">
        <i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i>
      </button>
    </td>
    <td class="text-center">
      <button type="button" onclick="this.closest('tr').remove(); recalcTotals()">
        <i class="fa-regular fa-trash-can text-2xl text-red-500"></i>
      </button>
    </td>
  `;
    // wire up listeners so totals recalc on edit
    tr.querySelector("input.potongan")
        .addEventListener("input", recalcTotals);
    tr.querySelector("input.nilaiByr")
        .addEventListener("input", recalcTotals);

    tbody.appendChild(tr);
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

function recalcTotals() {
    let sumFaktur = 0,
        sumPotong = 0,
        sumBayar = 0;

    document.querySelectorAll("#allpesanan tbody tr").forEach(tr => {
        const valF = parseInt(
            tr.querySelector("td.nilaiCell").textContent.replace(/\D/g, ""),
            10
        ) || 0;
        const valP = parseFloat(tr.querySelector("input.potongan").value) || 0;
        const valB = parseFloat(tr.querySelector("input.nilaiByr").value) || 0;

        sumFaktur += valF;
        sumPotong += valP;
        sumBayar += valB;
    });

    document.getElementById("tot_faktur").value = formatRupiah(sumFaktur);
    document.getElementById("tot_pot").value = sumPotong;
    document.getElementById("tot_lunas").value = sumBayar;
}

function callListener() {
    minusCheck()
    totalPelunasan()
    totalPotongan()
}