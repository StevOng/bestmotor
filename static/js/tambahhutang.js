document.addEventListener('DOMContentLoaded', () => {

    const tanggal = document.getElementById("tgl_byrhutang")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate
})

document.querySelectorAll(".potongan").forEach(input => {
    input.addEventListener("input", totalPotongan)
})

document.querySelectorAll(".nilaiBayar").forEach(input => {
    input.addEventListener("input", totalPelunasan)
})

document.addEventListener("change", function (e) {
    if (e.target.classList.contains("no_invoice")) {
      const lastRow = document.querySelector("tbody tr:last-child");
      const selectedValue = e.target.value;
  
      // Cek apakah dropdown dipilih dan belum pernah nambah baris baru
      if (selectedValue && !lastRow.classList.contains("new-row-added")) {
        addNewRow();
      }
    }
});

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
        columnDefs: [
            { className: "text-center", targets: [-1, -2] }, // kolom 8 dan 9 di tengah
        ],
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
        columnDefs: [
            { className: "text-center", targets: [-1, -2] }, // kolom 8 dan 9 di tengah
        ],
    });
    $(".dt-search").remove();
    $(".dt-info").remove();

    $("#invoiceSearch").on("keyup", function () {
        //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

function submit() {
    alert("tes")
}

// document.querySelectorAll(".btn-submit").forEach((btn) => {
//     btn.addEventListener("click", async (event) => {
//         event.preventDefault()

//         const row = btn.closest("tr")
//         const id = btn.dataset.id
//         const supplierId = document.getElementById("supplierId").value
//         const potongan = row.querySelector(".potongan").value
//         const nilaiByr = row.querySelector(".nilaiByr").value
//         const invoiceId = row.querySelector(".invoiceId").value

//         if (!supplierId || !invoiceId) {
//             alert("Supplier dan Invoice harus dipilih")
//             return
//         }
//         const hutang = new FormData()
//         hutang.append("supplier_id", supplierId)
//         hutang.append("nilai_bayar", nilaiByr)

//         if (potongan > 0) {
//             const response = await fetch(`/api/invoice/${invoiceId}/`, {
//                 method: "PATCH",
//                 body: JSON.stringify({
//                     potongan: potongan
//                 })
//             })
//             if (response.ok) {
//                 console.log(`Update nilai potongan pada invoice: ${invoiceId}, sebesar ${potongan}`)
//             }
//         }

//         const method = id ? "PATCH" : "POST" // jika ada id edit, tidak? tambah
//         const apiInvoice = id ? `/api/hutang/${id}/` : `/api/hutang/`

//         const response = await fetch(apiInvoice, {
//             method: method,
//             body: hutang
//         })
//         const result = await response.json()
//         console.log(result);
//     })
// })

function confirmPopupBtn(hutangId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = function () {
        const row = document.querySelector(`tr[data-id=${hutangId}]`)
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

function pilihInvoice(id, nomor, netto) {
    const inputInvoice = document.querySelectorAll("[id^='no_invoice-']")
    inputInvoice.forEach(invoice => {
        const displayText = `${nomor}`
        const row = invoice.closest('tr')
        const noInvoice = row.querySelector("[id^='no_invoice-']")
        const nettoId = invoice.dataset.netto
        const nettoEl = document.getElementById(nettoId)
        noInvoice.value = displayText
        const hiddenInput = row.querySelector(".invoiceId")
        if (hiddenInput) {
            hiddenInput.value = id
            nettoEl.textContent = netto
        }
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

function addNewRow() {
    const tbody = document.querySelector("tbody");
    const newRow = document.createElement("tr");

    const rowCount = tbody.querySelectorAll("tr").length + 1;

    newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td>
          <div class="relative">
            <input type="hidden" name="invoiceId" class="invoiceId" value="{{ invoice.id|default:"" }}">
            <input
              type="text"
              id="no_invoice-${rowCount}"
              data-netto="netto-${rowCount}"
              placeholder="Pilih Invoice"
              value="{{ invoice.no_invoice|default:"" }}"
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
        <td id="netto-${rowCount}">{{ invoice.netto|default:"" }}</td>
        <td>
          <input
            type="number"
            value="{{ invoice.hutang.potongan|default:"" }}"
            id="potongan-${rowCount}"
            class="potongan w-full rounded-md border-gray-300"
          />
        </td>
        <td>
          <input
            type="number"
            value="{{ invoice.hutang.nilai_bayar|default:"" }}"
            id="nilaiBayar-${rowCount}"
            class="nilaiBayar w-full rounded-md border-gray-300"
          />
        </td>
        <td>
          <button type="submit" data-id={{ invoice.hutang.id }}>
            <i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i>
          </button>
        </td>
        <td>
          <button onclick="hapusRow(this)">
            <i class="fa-regular fa-trash-can text-2xl text-red-500"></i>
          </button>
        </td>
    `

    tbody.appendChild(newRow);

    const btnSubmit = newRow.querySelector(".btn-submit")
    if (piutang?.id) {
        btnSubmit.setAttribute("data-id", piutang.id)
    }
}

function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}