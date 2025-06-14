$(document).ready(function () {
    let table = $('#allTransaksi').DataTable({
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

function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

function confirmPopupBtnMasuk(id) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");
    const csrfToken = getCSRFToken()

    confirmButton.onclick = async () => {
        try {
            const response = await fetch(`/api/transaksimasuk/${id}/`, {
                headers: {
                    'X-CSRFToken': csrfToken
                },
                method:"DELETE"
            })
            if (response.ok) {
                console.log("Transaksi masuk dihapus!");
                const row = document.querySelector(`tr[data-id="${id}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
            } else {
                console.error("Gagal menghapus objek");
            }
        } catch (error) {
            console.error("error: ", error);
        }
        closeModalConfirm();
    };
}

function confirmPopupBtnKeluar(id) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");
    const csrfToken = getCSRFToken()

    confirmButton.onclick = async () => {
        try {
            const response = await fetch(`/api/transaksikeluar/${id}/`, {
                headers: {
                    'X-CSRFToken': csrfToken
                },
                method: "DELETE"
            })
            if (response.ok) {
                console.log("Transaksi keluar dihapus!");
                const row = document.querySelector(`tr[data-id="${id}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
            } else {
                console.error("Gagal menghapus objek");
            }
        } catch (error) {
            console.error("error: ", error);
        }
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}