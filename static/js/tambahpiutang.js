document.addEventListener('DOMContentLoaded', () => {

    const tanggal = document.getElementById("tgl_byrhutang")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate
})

document.querySelector(".nilaiByr").addEventListener("input", callListener)
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

document.querySelectorAll(".nilaiByr").forEach(input => {
    input.addEventListener("input", totalPelunasan)
})

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

document.getElementById("toggleCheck")?.addEventListener("click", function () {
    document.getElementById("checkIcon").classList.toggle("hidden");
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
        <button onclick="pilihFaktur('${faktur.id}','${faktur.no_faktur}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
              <path d="M9.72217 11L12.7222 14L22.7222 4M16.7222 3H8.52217C6.84201 3 6.00193 3 5.3602 3.32698C4.79571 3.6146 4.33677 4.07354 4.04915 4.63803C3.72217 5.27976 3.72217 6.11984 3.72217 7.8V16.2C3.72217 17.8802 3.72217 18.7202 4.04915 19.362C4.33677 19.9265 4.79571 20.3854 5.3602 20.673C6.00193 21 6.84201 21 8.52217 21H16.9222C18.6023 21 19.4424 21 20.0841 20.673C20.6486 20.3854 21.1076 19.9265 21.3952 19.362C21.7222 18.7202 21.7222 17.8802 21.7222 16.2V12" stroke="#3D5A80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

function pilihFaktur(id, no_faktur) {
    if (document.querySelector(`.fakturId[value='${id}']`)) {
        closeModalFaktur();
        return;
    }

    fetch(`/api/faktur/${id}/`)
        .then(res => res.json())
        .then(data => {
            addNewRow(data);
            closeModalFaktur();
        });
}

function addNewRow(faktur) {
    const tbody = document.querySelector("#allpesanan tbody");
    const rowNum = tbody.children.length + 1;
    const tr = document.createElement("tr");

    tr.innerHTML = `
    <td>${rowNum}</td>
    <td>
      <input type="hidden" name="fakturId" class="fakturId" value="${faktur.id}">
      <input type="text" class="noFaktur" value="${faktur.no_faktur}" disabled>
    </td>
    <td id="nilaiFaktur-${rowNum}">Rp ${formatRupiah(faktur.total)},-</td>
    <td><input type="number" value="0" class="potongan"></td>
    <td><input type="number" value="0" class="nilaiByr"></td>
    <td class="text-center">
      <button type="button" onclick="submitDetail()">
        <i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i>
      </button>
    </td>
    <td class="text-center">
      <button onclick="hapusRow(this)">
        <i class="fa-regular fa-trash-can text-2xl text-red-500"></i>
      </button>
    </td>
  `;
    tbody.appendChild(tr);
}

async function submitDetail() {
    const id = document.getElementById("piutangId")?.value
    const fakturIds = Array.from(document.querySelectorAll(".fakturId")).map(input => parseInt(input.value)).filter(val => !isNaN(val))
    const nilaiByrs = Array.from(document.querySelectorAll(".nilaiByr")).map(input => parseFloat(input.value)).filter(val => !isNaN(val))
    const custId = document.getElementById(".custId").value
    const potongan = Array.from(document.querySelectorAll(".potongan")).map(input => parseFloat(input.value)).filter(val => !isNaN(val))
    const sales = document.getElementById("sales").value

    if (!sales || !fakturIds || !custId) {
        showWarningToast("Data Penting", "Lengkapi data seperti sales, faktur dan customer")
        return
    }

    const method = id ? "PUT" : "POST" // jika ada id edit, tidak? tambah
    const apiUrl = id ? `/api/piutang/${id}/` : `/api/piutang/`
    const csrfToken = getCSRFToken()
    try {
        const list_faktur = fakturIds.map((fakturId, index) => ({
            faktur: fakturId,
            nilai_bayar: nilaiByrs[index]

        }))
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                "customer_id": custId,
                "list_faktur": list_faktur
            })
        })
        const result = await response.json()
        if (response.ok) {
            await Promise.all(fakturIds.map(async (fakturId, index) => {
                const nilaiPotongan = potongan[index]
                if (nilaiPotongan && nilaiPotongan > 0) {
                    try {
                        const patchRes = await fetch(`/api/faktur/${fakturId}/`, {
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
                            console.warn(`Gagal PATCH potongan faktur ${fakturId}`)
                        }
                    } catch (err) {
                        console.error(`Error saat PATCH faktur ${fakturId}`, err)
                    }
                }
            }))
            console.log("Piutang berhasil disimpan:", result);
            setTimeout(() => {
                location.replace(`/penjualan/pembayaran/piutang/`);
            }, 1000);
        } else {
            console.error("Gagal:", result);
            showWarningToast("Gagal", "Terjadi kesalahan saat menyimpan data");
        }
    } catch (error) {
        console.error("Terjadi kesalahan: ", error)
    }
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

// function addNewRow(piutang = null, data_faktur = null) {
//     const tbody = document.querySelector("#allpesanan tbody");
//     const newRow = document.createElement("tr");
//     const rowCount = tbody.querySelectorAll("tr").length + 1;

//     const fakturId = data_faktur?.id || ""
//     const noFaktur = `noFaktur-${rowCount}`


//     newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
//     newRow.innerHTML = `
//         <td>${rowCount}</td>
//         <td>
//             <div class="relative mt-1">
//               <input type="hidden" name="fakturId-${rowCount}" class="fakturId" value="${fakturId}">
//               <input type="text" id="${noFaktur}" placeholder="Pilih Faktur" value="${data_faktur?.no_faktur || ""}" disabled
//                 class="mt-1 block w-36 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-customBlue focus:border-customBlue" data-nama-cust="namaCust-${rowCount}" data-nilai-faktur="nilaiFaktur-${rowCount}">
//                 <button type="button" onclick="openModalFaktur()"
//                 class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none">
//                 <i class="fas fa-ellipsis-h"></i>
//               </button>
//             </div>
//         </td>
//         <td id="namaCust-${rowCount}">
//           <input type="hidden" name="custId-${rowCount}" class="custId" value="${piutang?.customer_id || ""}">
//           ${piutang?.customer_id.nama || ""}
//         </td>
//         <td id="nilaiFaktur-${rowCount}">Rp ${formatRupiah(piutang?.total_faktur) || ""},-</td>
//         <td><input type="number" value="${piutang?.potongan || ""}" id="potongan-${rowCount}" class="potongan w-full rounded-md border-gray-300" /></td>
//         <td><input type="number" value="${piutang?.nilai_bayar || ""}" id="nilaiByr-${rowCount}" class="nilaiByr w-full rounded-md border-gray-300" /></td>
//         <td class="text-center"><button type="button" onclick="submitDetail()" class="btn-submit"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
//         <tdclass="text-center"><button onclick="hapusRow(this)"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
//     `

//     tbody.appendChild(newRow);

//     setTimeout(() => {
//         pilihFaktur(fakturId, noFaktur)
//     }, 0);

//     newRow.querySelector(".nilaiByr").addEventListener("input", callListener)
//     newRow.querySelector(".potongan").addEventListener("input", callListener)
// }

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

function callListener() {
    minusCheck()
}