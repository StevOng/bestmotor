//   {% comment %} tabel retur beli {% endcomment %}
$(document).ready(function () {
    let table = $('#allReturan').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        autoWidth: false,
        ordering: false,
        scrollX: true,
        responsive: true,
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

function confirmPopupBtn(returId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");
    const csrfToken = getCSRFToken()

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/returbeli/${returId}/`, {
                headers: {
                    'X-CSRFToken': csrfToken
                },
                method: "DELETE"
            })
            if (response.ok) {
                const result = await response.json()
                const row = document.querySelector(`tr[data-id="${returId}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
                console.log(result)
            } else {
                console.error("Gagal menghapus returan")
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