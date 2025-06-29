document.addEventListener('DOMContentLoaded', () => {

    const tanggal = document.getElementById("tgl_byrhutang")
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
function openModalInv() {
    let modal = document.getElementById("popupModalInv");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
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
    const nilaiByrs = Array.from(document.querySelectorAll(".nilaiByr")).map(input => parseFloat(input.value)).filter(val => !isNaN(val))
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

function pilihInvoice(id, nomor) {
    const inputInvoice = document.querySelectorAll("[id^='no_invoice-']")
    inputInvoice.forEach(invoice => {
        const displayText = `${nomor}`
        const row = invoice.closest('tr')
        const noInvoice = row.querySelector("[id^='no_invoice-']")
        noInvoice.value = displayText
        const hiddenInput = row.querySelector(".invoiceId")
        if (hiddenInput) {
            hiddenInput.value = id
        }

        const nilaiInv = invoice.dataset.netto

        invoice.addEventListener('change', async () => {
            const invoiceId = invoice.value

            const response = await fetch(`/api/invoice/${invoiceId}/`)
            const data = await response.json()

            const nilaiInvEl = document.getElementById(nilaiInv)
            if (nilaiInvEl && data.netto) {
                nilaiInvEl.textContent = data.netto.toLocaleString("en-EN")
            }

            // Cek apakah ini baris terakhir → baru tambahkan baris baru
            const allRows = document.querySelectorAll("tbody tr");
            const isLast = row === allRows[allRows.length - 1];
            if (isLast) {
                addNewRow();
            }
        })
    })
    closeModalInv()
}

function pilihSupplier(id, perusahaan) {
    const supplierId = document.getElementById("supplierId")
    const supplier = document.getElementById("supplier")
    if (supplierId) {
        supplierId.value = id
        supplier.value = perusahaan
    }
    closeModalSupp()
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

function formatRupiah(angka){
    if (isNaN(angka)) return "";
    angka = Math.floor(angka);
    return angka.toLocaleString("en-EN");
}

function addNewRow(hut = null, invoices = null) {
    const tbody = document.querySelector("#allpesanan tbody");
    const newRow = document.createElement("tr");
    const rowCount = tbody.querySelectorAll("tr").length + 1;

    const invoiceId = invoices?.id || ""
    const noInv = `no_invoice-${rowCount}`

    newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td>
          <div class="relative">
            <input type="hidden" name="invoiceId" class="invoiceId" value="${invoiceId}">
            <input
              type="text"
              id="${noInv}"
              data-netto="netto-${rowCount}"
              placeholder="Pilih Invoice"
              value="${invoices?.no_invoice || ""}"
              disabled
              class="block border w-36 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-customBlue focus:border-customBlue"
            />
            <button
              type="button"
              onclick="openModalInv()"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none"
            >
              <i class="fas fa-ellipsis-h mr-1"></i>
            </button>
          </div>
        </td>
        <td id="netto-${rowCount}">${formatRupiah(invoices?.netto) || ""}</td>
        <td>
          <input
            type="number"
            value="${hut?.potongan || ""}"
            id="potongan-${rowCount}"
            class="potongan w-full rounded-md border-gray-300"
          />
        </td>
        <td>
          <input
            type="number"
            value="${hut?.nilai_byr || ""}"
            id="nilaiBayar-${rowCount}"
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
    `

    tbody.appendChild(newRow);

    setTimeout(() => {
        pilihInvoice(invoiceId, noInv)
    }, 0);

    newRow.querySelector(".nilaiBayar").addEventListener("input", callListener)
    newRow.querySelector(".potongan").addEventListener("input", callListener)
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
}