document.addEventListener("DOMContentLoaded", checkBox)

$(document).ready(function () {
    let table = $('#allpesanan').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] }, // kolom 8 dan 9 di tengah
        ],
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
        },
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] }, // kolom 8 dan 9 di tengah
        ],
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
    let checkAll = document.getElementById("checkedAll")
    let allCheckBox = document.querySelectorAll("[id^='checkbox-']")
    let buttonStats = document.getElementById("changeAll")
    if (trData.length == 0 || !trData) {
        checkAll.classList.remove("cursor-pointer")
        checkAll.disabled = true
    }

    function updateButtonState() {
        const anyChecked = Array.from(allCheckBox).some(cb => cb.checked);
        buttonStats.disabled = !anyChecked;
        console.log("Tombol aktif?", !buttonStats.disabled);
    }

    checkAll.addEventListener("change", () => {
        checkAll.checked
        buttonStats.disabled = !checkAll.checked
        console.log("Centang semua:", checkAll.checked);
        console.log("button disabled:", buttonStats.disabled)
        allCheckBox.forEach(checkbox => {
            checkbox.checked = checkAll.checked
            console.log("Checkbox update:", checkbox.id, checkbox.checked)
        })
    })

    allCheckBox.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const allChecked = Array.from(allCheckBox).every(cb => cb.checked);
            checkAll.checked = allChecked;  // Update status "check all" jika semua dicentang

            updateButtonState(); // Update status tombol
            console.log("Checkbox manual:", checkbox.id, checkbox.checked);
        });
    });
}

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
                    }
                }
            } else {
                console.error("Gagal membatalkan pesanan");
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

async function updateBulkStatus(newStatus) {
    const checkboxes = document.querySelectorAll("[id^='checkbox-']")
    const ids = Array.from(checkboxes).map(cb => cb.checked)
    const csrfToken = getCSRFToken()

    if (ids.length === 0) {
        alert('Pilih setidaknya satu pesanan')
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
        alert('status berhasil diubah')
        window.location.reload()
    } else {
        alert("gagal: " + result.error)
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
        alert("Status berhasil diubah!");
        window.location.reload();
    } else {
        alert("Gagal: " + result.error);
    }
}
