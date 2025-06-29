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

document.addEventListener("DOMContentLoaded", checkBox);

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