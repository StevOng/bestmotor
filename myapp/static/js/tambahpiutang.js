document.addEventListener('DOMContentLoaded', () => {

    const tanggal = document.getElementById("tgl_byrhutang")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate
})

document.addEventListener("change", function (e) {
    if (e.target.classList.contains("noFaktur")) {
      const lastRow = document.querySelector("tbody tr:last-child");
      const selectedValue = e.target.value;
  
      // Cek apakah dropdown dipilih dan belum pernah nambah baris baru
      if (selectedValue && !lastRow.classList.contains("new-row-added")) {
        addNewRow();
      }
    }
});

//PopupModal Customer
function openModalSales() {
    let modal = document.getElementById("popupModalSales");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModalSales() {
    let modal = document.getElementById("popupModalSales");
    modal.classList.remove("flex");
    modal.classList.add("hidden");
}

$(document).ready(function () {
    let table = $('#modalSales').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] } // kolom 8 dan 9 di tengah
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#salesSearch').on('keyup', function () {
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

//PopupModal Customer
function openModalFaktur() {
    let modal = document.getElementById("popupModalFaktur");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModalFaktur() {
    let modal = document.getElementById("popupModalFaktur");
    modal.classList.remove("flex");
    modal.classList.add("hidden");
}

$(document).ready(function () {
    let table = $('#modalFaktur').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] } // 2 kolom terakhir di tengah
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#fakturSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

document.getElementById("toggleCheck").addEventListener("click", function () {
    document.getElementById("checkIcon").classList.toggle("hidden");
});

function confirmPopupBtn(piutangId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/piutang/${piutangId}`, {
                method: "DELETE"
            })
            if (response.ok) {
                console.log("Faktur piutang dihapus!");
                const row = document.querySelector(`tr[data-id="${piutangId}"]`);
                row.querySelectorAll("input, select, textarea").forEach((el) => {
                    el.value = ""
                    if (el.tagName == "select") {
                        el.selectedIndex = 0
                    }
                })
                row.removeAttribute("data-id")
            } else {
                console.error("Gagal menghapus faktur piutang");
            }
        } catch (error) {
            console.error("Terjadi kesalahan: ", error);
        }
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}

function pilihSales(id, nama) {
    let displayText = `${nama}`

    document.getElementById("sales").value = displayText

    let hiddenInput = document.getElementById("salesId")
    if (hiddenInput) {
        hiddenInput.value = id
    }
    closeModalSales()
}

function pilihFaktur(id, nomor) {
    const fakturInputs = document.querySelectorAll("[id^='noFaktur-']")
    fakturInputs.forEach(faktur => {
        const displayText = `${nomor}`
        const row = faktur.closest('tr')
        const noFaktur = row.querySelector("[id^='noFaktur-']")
        noFaktur.value = displayText
        const hiddenInput = row.querySelector("fakturId")
        if (hiddenInput) {
            hiddenInput.value = id
        }
        const namaCust = faktur.dataset.namaCust
        const nilaiFaktur = faktur.dataset.nilaiFaktur

        faktur.addEventListener('change', async () => {
            const fakturId = faktur.value

            const response = await fetch(`/api/faktur/${fakturId}`)
            const data = await response.json()

            const namaCustEl = document.getElementById(namaCust)
            if (namaCustEl && data.pesanan_id.customer_id.nama) {
                namaCustEl.textContent = data.pesanan_id.customer_id.nama
            }
            const nilaiFakturEl = document.getElementById(nilaiFaktur)
            if (nilaiFakturEl && data.total) {
                nilaiFakturEl.textContent = data.total
            }
        })
    })
    closeModalFaktur()
}

document.querySelectorAll(".btn-submit").forEach((btn) => {
    btn.addEventListener("submit", async (event) => {
        event.preventDefault()

        const row = btn.closest("tr")
        const id = btn.dataset.id
        const custId = row.querySelector(".custId").value
        const potongan = row.querySelector(".potongan").value
        const nilaiByr = row.querySelector(".nilaiByr").value
        const fakturId = row.querySelector(".fakturId").value
        const sales = document.getElementById("sales").value

        if (!sales || !fakturId) {
            alert("Sales dan Faktur harus dipilih")
            return
        }
        const piutang = new FormData()
        piutang.append("customer_id", custId)
        piutang.append("potongan", potongan)
        piutang.append("nilai_bayar", nilaiByr)

        const method = id ? "PATCH" : "POST" // jika ada id edit, tidak? tambah
        const apiInvoice = id ? `/api/piutang/${id}/` : `/api/piutang/`

        const response = await fetch(apiInvoice, {
            method: method,
            body: piutang
        })
        const result = await response.json()
        console.log(result);
    })
})

function addNewRow() {
    const tbody = document.querySelector("tbody");
    const newRow = document.createElement("tr");

    const rowCount = tbody.querySelectorAll("tr").length + 1;

    newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td>
            <div class="relative mt-1">
              <input type="hidden" name="fakturId-${rowCount}" class="fakturId" value="${data_faktur?.id || ""}">
              <input type="text" id="noFaktur-${rowCount}" placeholder="Pilih Faktur" value="${data_faktur?.no_faktur || ""}" disabled
                class="mt-1 block w-36 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-customBlue focus:border-customBlue" data-nama-cust="namaCust-${rowCount}" data-nilai-faktur="nilaiFaktur-${rowCount}">
                <button type="button" onclick="openModalFaktur()"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none">
                <i class="fas fa-ellipsis-h"></i>
              </button>
            </div>
        </td>
        <td id="namaCust-${rowCount}">
          <input type="hidden" name="custId-${rowCount}" class="custId" value="${piutang?.customer_id || ""}">
          ${piutang?.customer_id.nama || ""}
        </td>
        <td id="nilaiFaktur-${rowCount}">${piutang?.total_faktur || ""}</td>
        <td><input type="number" value="${piutang?.potongan || ""}" id="potongan-${rowCount}" class="potongan w-full rounded-md border-gray-300" /></td>
        <td><input type="number" value="${piutang?.nilai_bayar || ""}" id="nilaiByr-${rowCount}" class="nilaiByr w-full rounded-md border-gray-300" /></td>
        <td><button type="submit" class="btn-submit" data-id=""><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
        <td><button onclick="hapusRow(this)"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
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
