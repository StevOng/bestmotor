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
      {
        orderable: false,
        render: DataTable.render.select(),
        targets: 0
    }
  ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#tableSearch').on('keyup', function () { //search
      let searchValue = $(this).val();
      table.search(searchValue).draw();
    });
});

function confirmPopupBtn() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/pesanan/${id}/`, {
                method: "DELETE"
            })
            if (response.ok) {
                console.log("Pesanan berhasil dihapus");
                document.querySelector(`button[onclick="confirmPopupBtn(${id})"]`).closest("tr").remove()
            } else {
                console.error("Gagal menghapus pesanan");
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

document.getElementById('select-all-checkbox').addEventListener('change', () => {
    const isChecked = this.checked
    document.querySelectorAll('.checkbox-pesanan').forEach(cb => {
        cb.checked = isChecked
    })
})

async function updateBulkStatus(newStatus) {
    const checkboxes = document.querySelectorAll('.checkbox-pesanan:checked')
    let ids = Array.from(checkboxes).map(cb => cb.value)

    if (ids.length === 0) {
        alert('Pilih setidaknya satu pesanan')
        return
    }

    let response = await fetch('/api/pesanan/update_status_bulk/', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids, status: newStatus })
    })

    let result = await response.json()
    if (response.ok) {
        alert('status berhasil diubah')
        window.location.reload()
    } else {
        alert("gagal: "+ result.error)
    }
}

async function updateSingleStatus(id, newStatus) {
    const response = await fetch(`/api/pesanan/${id}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();
    if (response.ok) {
        alert("Status berhasil diubah!");
        window.location.reload();
    } else {
        alert("Gagal: " + result.error);
    }
}
