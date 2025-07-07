document.addEventListener('DOMContentLoaded', () => {

  const tanggal = document.getElementById("tgl_byrhutang")
  const today = new Date()
  const year = String(today.getFullYear())
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  const formatDate = `${day}/${month}/${year}`

  tanggal.value = formatDate
})

document.querySelector(".nilaiBayar").addEventListener("input", callListener)
document.querySelector(".potongan").addEventListener("input", callListener)

function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

$(document).ready(function () {
  $("#allpesanan").DataTable({
    pageLength: 20,
    lengthChange: false, // Hilangkan "Show entries"
    ordering: false,
    scrollX: true,
  });
  $(".dt-search").remove();
  $(".dt-info").remove();
});

document.querySelectorAll(".potongan").forEach(input => {
  input.addEventListener("input", totalPotongan)
})

document.querySelectorAll(".nilaiBayar").forEach(input => {
  input.addEventListener("input", totalPelunasan)
})

//PopupModal Supplier
function openModalSupp() {
  let modal = document.getElementById("popupModalSupp");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModalSupp() {
  let modal = document.getElementById("popupModalSupp");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

//tabel modal popup supplier
$(document).ready(function () {
  let table = $("#modalSupplier").DataTable({
    pageLength: 20,
    lengthChange: false, // Hilangkan "Show entries"
    ordering: false,
    scrollX: true,
  });
  $(".dt-search").remove();
  $(".dt-info").remove();

  $("#supplierSearch").on("keyup", function () {
    //search
    let searchValue = $(this).val();
    table.search(searchValue).draw();
  });
});

//PopupModal Invoice
let currentRow = null;

function openModalInv(btn) {
  currentRow = btn.closest("tr");
  const modal = document.getElementById("popupModalInv")
  modal.classList.replace("hidden", "flex");

  // Ambil supplier ID & nama dari input (hidden/input teks)
  const supplierId = document.getElementById("supplierId").value;
  const supplierNama = document.getElementById("supplier").value;

  // Jika supplier sudah dipilih, langsung load daftar invoice-nya
  if (supplierId) {
    pilihSupplier(supplierId, supplierNama);
  } else {
    // Bisa kasih warning atau clear invoice list
    return showWarningToast("Supplier Kosong","Supplier belum dipilih");
  }
}

function closeModalInv() {
  let modal = document.getElementById("popupModalInv");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

//Tabel Modal Popup Invoice
$(document).ready(function () {
  let table = $("#modalInvoice").DataTable({
    pageLength: 20,
    lengthChange: false, // Hilangkan "Show entries"
    ordering: false,
    scrollX: true,
  });
  $(".dt-search").remove();
  $(".dt-info").remove();

  $("#invoiceSearch").on("keyup", function () {
    //search
    let searchValue = $(this).val();
    table.search(searchValue).draw();
  });
});

async function submitDetail() {
  const id = document.getElementById("hutId")?.value
  const supplierId = document.getElementById("supplierId")?.value
  const potongan = Array.from(document.querySelectorAll(".potongan")).map(input => parseFloat(input.value)).filter(val => !isNaN(val))
  const nilaiByrs = Array.from(document.querySelectorAll(".nilaiBayar")).map(input => parseFloat(input.value)).filter(val => !isNaN(val))
  const invoiceIds = Array.from(document.querySelectorAll(".invoiceId")).map(input => parseInt(input.value)).filter(val => !isNaN(val))

  if (!supplierId || !invoiceIds) {
    showWarningToast("Data Kurang", "Lengkapi data supplier dan invoice")
    return
  }

  const method = id ? "PUT" : "POST" // jika ada id edit, tidak? tambah
  const apiUrl = id ? `/api/hutang/${id}/` : `/api/hutang/`
  const csrfToken = getCSRFToken()
  try {
    const list_invoice = invoiceIds.map((invoiceId, index) => ({
      invoice: invoiceId,
      nilai_bayar: nilaiByrs[index]
    }))
    const response = await fetch(apiUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({
        "supplier_id": supplierId,
        "list_invoice": list_invoice
      })
    })
    const result = await response.json()
    if (response.ok) {
      await Promise.all(invoiceIds.map(async (invoiceId, index) => {
        const nilaiPotongan = potongan[index]
        if (nilaiPotongan && nilaiPotongan > 0) {
          try {
            const patchRes = await fetch(`/api/invoice/${invoiceId}/`, {
              method: "PATCH",
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
              },
              body: JSON.stringify({
                potongan: nilaiPotongan
              })
            })
            if (!patchRes.ok) {
              console.warn(`Gagal PATCH potongan invoice ${invoiceId}`)
            }
          } catch (err) {
            console.error(`Error saat PATCH invoice ${invoiceId}`, err)
          }
        }
      }))
      console.log("Piutang berhasil disimpan:", result);
      showSuccessToast("Berhasil", "Berhasil menyimpan data")
      setTimeout(() => {
        location.replace(`/pembelian/pembayaran/hutang/`);
      }, 1000);
    } else {
      console.error("Gagal:", result);
      showWarningToast("Gagal", "Gagal menyimpan data")
    }
  } catch (error) {
    console.error("Terjadi kesalahan: ", error)
    showWarningToast("Gagal", "Terjadi kesalahan")
  }
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

async function pilihInvoice(id, nomor) {
  const row = currentRow;
  const inputInvoice = row.querySelector(".invoiceId");
  const noInvoiceInput = row.querySelector("#no_invoice");
  const nilaiInvoiceCell = row.querySelector(".nettoCell");
  const sudahDipakai = Array.from(document.querySelectorAll("input.invoiceId"))
  .some(input => input.value === id);

  if (sudahDipakai) {
    alert("Invoice ini sudah dipakai di baris lain!");
    return;
  }

  try {
    const res = await fetch(`/api/invoice/${id}/data/?format=json`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();

    inputInvoice.value = id;
    noInvoiceInput.value = data.no_invoice || nomor;
    if (data.netto_after_retur){
      nilaiInvoiceCell.textContent = `Rp ${formatRupiah(data.netto_after_retur)},-`;
    } else {
      nilaiInvoiceCell.textContent = `Rp ${formatRupiah(data.netto)},-`;
    }

    recalcTotals();

    // Jika ini baris terakhir, tambahkan baris baru
    const allRows = document.querySelectorAll("#allpesanan tbody tr");
    if (row === allRows[allRows.length - 1]) {
      addNewRow();
    }
  } catch (err) {
    console.error("Error ambil detail invoice:", err);
    showWarningToast("Gagal", "Gagal mengambil data invoice");
  } finally {
    closeModalInv();
  }
}

async function pilihSupplier(id, perusahaan) {
  const supplierIdInput = document.getElementById("supplierId");
  const supplierInput = document.getElementById("supplier");

  supplierIdInput.value = id;
  supplierInput.value = perusahaan;

  try {
    const response = await fetch(`/api/invoice/by_supplier/${id}/`);
    const invoices = await response.json();

    const tbody = document.getElementById("invoiceTbody");
    tbody.innerHTML = "";

    // Ambil semua invoice ID yang sudah dipakai di input.invoiceId di semua baris
    const selectedInvoiceIds = Array.from(
      document.querySelectorAll("input.invoiceId")
    )
    .map(input => input.value)
    .filter(val => val !== "");

    if (invoices.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500">Tidak ada invoice</td></tr>`;
    } else {
      // Filter hanya invoice yang belum dipilih
      const invoicesToRender = invoices.filter(invoice =>
        !selectedInvoiceIds.includes(String(invoice.id))
      );

      if (invoicesToRender.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500">Semua invoice sudah dipilih</td></tr>`;
        return;
      }

      invoicesToRender.forEach(invoice => {
        tbody.innerHTML += `
          <tr>
            <td>${invoice.no_invoice}</td>
            <td>${new Date(invoice.tanggal).toLocaleDateString()}</td>
            <td>${invoice.no_referensi ?? '-'}</td>
            <td>${perusahaan}</td>
            <td>Rp ${invoice.netto.toLocaleString()}</td>
            <td class="text-center">
              <button onclick="pilihInvoice('${invoice.id}', '${invoice.no_invoice}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                  <path d="M9.72217 11L12.7222 14L22.7222 4M16.7222 3H8.52217C6.84201 3 6.00193 3 5.3602 3.32698C4.79571 3.6146 4.33677 4.07354 4.04915 4.63803C3.72217 5.27976 3.72217 6.11984 3.72217 7.8V16.2C3.72217 17.8802 3.72217 18.7202 4.04915 19.362C4.33677 19.9265 4.79571 20.3854 5.3602 20.673C6.00193 21 6.84201 21 8.52217 21H16.9222C18.6023 21 19.4424 21 20.0841 20.673C20.6486 20.3854 21.1076 19.9265 21.3952 19.362C21.7222 18.7202 21.7222 17.8802 21.7222 16.2V12"
                    stroke="#3D5A80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </td>
          </tr>
        `;
      });
    }
  } catch (err) {
    console.error("Gagal mengambil invoice:", err);
  }

  closeModalSupp();
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
  const bayar = document.querySelectorAll(".nilaiBayar")
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
  const tbody = document.getElementById("allpesanan-body");
  const idx = tbody.children.length + 1;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <tr>
      <td>${idx}</td>
      <td>
        <div class="relative">
          <input type="hidden" name="invoiceId" class="invoiceId" value="">
          <input
            type="text"
            id="no_invoice"
            data-netto="netto"
            placeholder="Pilih Invoice"
            value=""
            disabled
            class="block border w-36 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-customBlue focus:border-customBlue"
          />
          <button
            type="button"
            onclick="openModalInv(this)"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none"
          >
            <i class="fas fa-ellipsis-h mr-1"></i>
          </button>
        </div>
      </td>
      <td class="nettoCell">Rp 0</td>
      <td>
        <input
          type="number"
          value=""
          id="potongan"
          class="potongan w-full rounded-md border-gray-300"
        />
      </td>
      <td>
        <input
          type="number"
          value=""
          id="nilaiBayar"
          class="nilaiBayar w-full rounded-md border-gray-300"
        />
      </td>
      <td class="text-center">
        <button type="button" onclick="submitDetail()" class="btn-submit">
          <i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i>
        </button>
      </td>
      <td class="text-center">
        <button onclick="hapusRow(this)">
          <i class="fa-regular fa-trash-can text-2xl text-red-500"></i>
        </button>
      </td>
    </tr>
  `;
  tbody.appendChild(tr);
  // attach listeners
  tr.querySelector(".potongan").addEventListener("input", recalcTotals);
  tr.querySelector(".nilaiBayar").addEventListener("input", recalcTotals);
}

function recalcTotals() {
  // total invoice
  let sumInv = 0;
  document.querySelectorAll(".nettoCell").forEach(td => {
    sumInv += parseInt(td.textContent.replace(/\D/g, '')) || 0;
  });
  document.getElementById("tot_inv").value = formatRupiah(sumInv);

  // total potongan
  let sumPot = 0;
  document.querySelectorAll(".potongan").forEach(i => sumPot += parseFloat(i.value) || 0);
  document.getElementById("tot_pot").value = formatRupiah(sumPot);

  // total bayar
  let sumByr = 0;
  document.querySelectorAll(".nilaiBayar").forEach(i => sumByr += parseFloat(i.value) || 0);
  document.getElementById("tot_lunas").value = formatRupiah(sumByr);
}

function hapusRow(btn) {
  const row = btn.closest("tr")
  row.classList.add("fade-out")
  setTimeout(() => row.remove(), 400)
  const supplierId = document.getElementById("supplierId").value;
  const supplierNama = document.getElementById("supplier").value;

  if (supplierId) {
    pilihSupplier(supplierId, supplierNama);
  }
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

function callListener() {
  minusCheck()
}