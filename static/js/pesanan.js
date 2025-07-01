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
});

$(document).ready(function () {
    let table = $('#pesananTunda').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        select: {
            style: 'multi',
            selector: 'td:first-child',
        }
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#tableSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

function checkBoxPending() {
    const trData = document.querySelectorAll("tbody tr")
    const checkAll = document.getElementById("checkedAll")
    const allCheckBox = document.querySelectorAll("[id^='checkbox-']")
    const buttonStats = document.getElementById("changeAll")

    // Jika elemen penting tidak ditemukan, hentikan eksekusi
    if (!checkAll || !buttonStats) return;

    if (trData.length === 0) {
        checkAll.classList.remove("cursor-pointer")
        checkAll.disabled = true
    }

    function updateButtonState() {
        const anyChecked = Array.from(allCheckBox).some(cb => cb.checked);
        buttonStats.disabled = !anyChecked;
        console.log("Tombol aktif?", !buttonStats.disabled);
    }

    checkAll.addEventListener("change", () => {
        buttonStats.disabled = !checkAll.checked;
        allCheckBox.forEach(checkbox => {
            checkbox.checked = checkAll.checked;
        });
    });

    allCheckBox.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const allChecked = Array.from(allCheckBox).every(cb => cb.checked);
            checkAll.checked = allChecked;
            updateButtonState();
        });
    });
}

function checkBox() {
    const trData = document.querySelectorAll("tbody tr")
    const checkAll = document.getElementById("checkbox-")
    const allCheckBox = document.querySelectorAll("[id^='default-checkbox-']")
    const buttonStats = document.getElementById("changeAll")

    // Jika elemen penting tidak ditemukan, hentikan eksekusi
    if (!checkAll || !buttonStats) return;

    if (trData.length === 0) {
        checkAll.classList.remove("cursor-pointer")
        checkAll.disabled = true
    }

    function updateButtonState() {
        const anyChecked = Array.from(allCheckBox).some(cb => cb.checked);
        buttonStats.disabled = !anyChecked;
        console.log("Tombol aktif?", !buttonStats.disabled);
    }

    checkAll.addEventListener("change", () => {
        buttonStats.disabled = !checkAll.checked;
        allCheckBox.forEach(checkbox => {
            checkbox.checked = checkAll.checked;
        });
    });

    allCheckBox.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const allChecked = Array.from(allCheckBox).every(cb => cb.checked);
            checkAll.checked = allChecked;
            updateButtonState();
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    checkBox()
    checkBoxPending()
});

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

function confirmPopupBtn(id) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");
    const csrfToken = getCSRFToken()

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/pesanan/${id}/cancelled/`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    "status": "cancelled"
                })
            })
            if (response.ok) {
                console.log("Pesanan berhasil dibatalkan");
                const row = document.querySelector(`tr[data-id="${id}"]`)
                if (row) {
                    const statusCell = row.querySelector("td:nth-child(8)")
                    if (statusCell) {
                        statusCell.textContent = "Cancelled"
                        showSuccessToast("Berhasil", "Status berhasil dibatalkan")
                    }
                }
            } else {
                console.error("Gagal membatalkan pesanan");
                showWarningToast("Gagal", "Gagal membatalkan pesanan")
            }
        } catch (error) {
            console.error("Terjadi kesalahan: ", error);
            showWarningToast("Gagal", "Terjadi kesalahan")
        }
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}

async function updateBulkStatus(newStatus) {
    const checkboxes = document.querySelectorAll("[id^='checkbox-']")
    const ids = Array.from(checkboxes).map(cb => cb.checked)
    const csrfToken = getCSRFToken()

    if (ids.length === 0) {
        showWarningToast("Pilihan Kosong", "Centang setidaknya satu pesanan untuk diubah status")
        return
    }

    const response = await fetch('/api/pesanan/update_status_bulk/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken

        },
        body: JSON.stringify({
            "ids": ids,
            "status": newStatus
        })
    })

    const result = await response.json()
    if (response.ok) {
        console.log(result)
        showSuccessToast("Berhasil", "Berhasil mengubah status")
        window.location.reload()
    } else {
        console.error(result)
        showWarningToast("Gagal", "Gagal mengubah status")
    }
}

async function updateSingleStatus(id, newStatus) {
    const csrfToken = getCSRFToken()
    const response = await fetch(`/api/pesanan/${id}/update_status_single/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ "status": newStatus })
    });

    const result = await response.json();
    if (response.ok) {
        console.log(result)
        showSuccessToast("Berhasil", "Status berhasil diubah")
        window.location.reload();
    } else {
        console.error(result)
        showWarningToast("Gagal", `Gagal mengubah status`)
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
      <div class="toast flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-100 shadow-lg">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 id="toastScs" class="text-sm font-medium text-yellow-800">${head}</h3>
          <p id="toastScsp" class="mt-1 text-sm text-yellow-600">${msg}</p>
        </div>
        <button onclick="document.getElementById('toastSuccess').classList.add('hidden')"  class="ml-auto text-yellow-400 hover:text-yellow-500">
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