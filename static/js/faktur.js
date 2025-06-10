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