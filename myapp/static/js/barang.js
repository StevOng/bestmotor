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

function confirmPopupBtn() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = function () {
        console.log("Pesanan dihapus!");
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}