$(document).ready(function () {
    let table = $('#allTransaksi').DataTable({
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
                showSuccessToast("Berhasil", "Berhasil menyimpan data")
                const row = document.querySelector(`tr[data-id="${id}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
            } else {
                console.error("Gagal menghapus objek");
                showWarningToast("Gagal", "Gagal menyimpan data")
            }
        } catch (error) {
            console.error("error: ", error);
            showWarningToast("Gagal", "Terjadi kesalahan")
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
                showSuccessToast("Berhasil", "Berhasil mengubah data")
                const row = document.querySelector(`tr[data-id="${id}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
            } else {
                console.error("Gagal menghapus objek");
                showWarningToast("Gagal", "Gagal menyimpan data")
            }
        } catch (error) {
            console.error("error: ", error);
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