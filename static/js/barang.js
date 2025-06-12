document.addEventListener('DOMContentLoaded', () => {
    fetchGambar()
})

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
                document.querySelector(`button[onclick="confirmPopupBtn(${barangId})"]`).closest("tr").remove()
            } else {
                console.error("Gagal menghapus barang");
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

async function fetchGambar() {
    try {
        const response = await fetch("/api/barang/")
        const data = await response.json()

        const containers = document.querySelectorAll(".gambarContainer")

        containers.forEach(container => {
            const brgId = container.dataset.brgId

            const detail = data.find(item => item.id == brgId) // cari data sesuai id
            if (detail && detail.gambar) {
                const img = document.createElement("img")
                img.className = "w-16 h-16"
                img.src = detail.gambar
                img.alt = detail.barang_id?.nama_barang || "Barang" // jika barang id true maka nama_barang jika false maka "Barang"

                container.innerHTML = "" // Kosongkan jika sebelumnya ada isi
                container.appendChild(img)
            }
        })
    } catch (err) {
        console.error(err);
    }
}