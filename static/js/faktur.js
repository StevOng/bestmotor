document.addEventListener('DOMContentLoaded', function () {
  getSales()
})

$(document).ready(function () {
  let table = $('#allpesanan').DataTable({
    pageLength: 20,
    lengthChange: false, // Hilangkan "Show entries"
    ordering: false,
    scrollX: true,
  });
  $('.dt-search').remove();
  $('.dt-info').remove();

  $('#tableSearch').on('keyup', function () { //search
    let searchValue = $(this).val();
    table.search(searchValue).draw();
  });
  // 1) Pasang custom filter
  $.fn.dataTable.ext.search.push(function (settings, data) {
    if (settings.nTable.id !== 'allpesanan') return true;

    const perVal = $('#per_tgl').val();        // bisa "2025-07-03" atau "07/03/2025"
    if (!perVal) return true;                  // kosong → tampilkan semua

    const txt = data[1].trim();
    let rowISO;
    // 1) normalisasi perVal → perISO = "YYYY-MM-DD"
    let perISO;
    if (/^\d{4}-\d{2}-\d{2}$/.test(perVal)) {
      perISO = perVal;
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(perVal)) {
      const [mo, da, yr] = perVal.split('/');
      perISO = `${yr}-${mo.padStart(2, '0')}-${da.padStart(2, '0')}`;
    } else {
      const dt = new Date(perVal);
      if (isNaN(dt.getTime())) return true;
      perISO = dt.toISOString().slice(0, 10);
    }

    // 2) parse teks tanggal faktur di kolom ke-2 (index 1)
    let datePart = txt;
    const parts = txt.split(',');
    if (parts.length >= 2) {
      // join dua segmen pertama: ["July 3", " 2025"] → "July 3, 2025"
      datePart = parts.slice(0, 2).join(',');
    }
    const d = new Date(datePart.trim());
    if (isNaN(d.getTime())) {
      // kalau tetap gagal parse, skip baris ini
      return false;
    }
    rowISO = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');

    // 3) bandingkan
    return rowISO === perISO;
  });

  $('#per_tgl').on('change', () => table.draw());
});

//PopupModal
function openModalExp() {
  let modal = document.getElementById("popupModalExp");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModalExp() {
  let modal = document.getElementById("popupModalExp");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

async function getSales() {
  console.log("panggil getSales")
  try {
    const response = await fetch('/api/user/list_sales/')
    console.log(response)
    const choices = await response.json()
    console.log(`data user: ${choices}`)

    const select = document.getElementById("sales-bestmtr")
    const selectedSales = select.dataset.selectedSales
    const inputSalesId = document.getElementById("salesId")

    choices.forEach(choice => {
      const option = document.createElement("option")
      option.value = choice.value
      option.textContent = choice.label

      if (String(choice.value) === String(selectedSales)) {
        option.selected = true
        inputSalesId.value = choice.value
        const placeholder = select.querySelector('option[value=""]')
        if (placeholder) placeholder.removeAttribute('selected')
      }

      select.appendChild(option)
    })
    select.addEventListener("change", (e) => {
      inputSalesId.value = e.target.value
      console.log("User memilih sales dengan ID:", e.target.value)
    })

  } catch (err) {
    console.error("Error:", err)
  }
}

function exportLaporanPDF() {
  const salesId = document.getElementById("salesId").value;
  const dariTgl = document.getElementById("dari_tgl").value;
  const smpeTgl = document.getElementById("smpe_tgl").value;
  const urlBase = document.getElementById("exportBtn").dataset.url;

  if (!salesId || !dariTgl || !smpeTgl) {
    showWarningToast("Data Kurang", "Mohon untuk mengisi semua filter terlebih dahulu")
    return;
  }

  const url = `${urlBase}?salesId=${salesId}&dari_tgl=${dariTgl}&smpe_tgl=${smpeTgl}`;
  console.log("Navigating to:", url);
  window.open(url, "_blank");
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