// {% comment %} tabel barang {% endcomment %}
$(document).ready(function () {
    let table = $('#tabel-brg').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        autoWidth: false,
        ordering: false,
        scrollX: true,
        responsive: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] } // isi field di tengah
        ],
        createdRow: function (row, data, dataIndex) { //menghapus padding field index 0
            $('td:eq(0)', row).css({ 'padding': 'unset' });
        }
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#tableSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });

    table.on('draw', function () {
        fetchGambar();
});
});

function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

function confirmPopupBtn(barangId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");
    const csrfToken = getCSRFToken()

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/barang/${barangId}/`, {
                method: "DELETE",
                headers: {
                    'X-CSRFToken': csrfToken
                }
            })
            if (response.ok) {
                console.log("Barang berhasil dihapus");
                showSuccessToast("Berhasil", "Berhasil menghapus data")
                document.querySelector(`button[onclick="confirmPopupBtn(${barangId})"]`).closest("tr").remove()
            } else {
                console.error("Gagal menghapus barang");
                showWarningToast("Gagal", "Gagal menghapus data")
            }
        } catch (error) {
            console.error("Terjadi kesalahan: ", error);
            showWarningToast("Gagal", "Terjadi Kesalahan")
        }
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
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