document.addEventListener("DOMContentLoaded", () => {
  getMerk()
})

$(document).ready(function () {
  let table = $('#tabel-bonus').DataTable({
    pageLength: 20,
    lengthChange: false, // Hilangkan "Show entries"
    autoWidth: false,
    ordering: false,
    scrollX: true,
    "columnDefs": [
      { className: "text-center", targets: [-1] } // isi field di tengah
    ],
  });
  $('.dt-search').remove();
  $('.dt-info').remove();

  $('#tableSearch').on('keyup', function () { //search
    let searchValue = $(this).val();
    table.search(searchValue).draw();
  });
});

//PopupModal
function openModalBonus() {
  let modal = document.getElementById("popupModalBonus");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModalBonus() {
  let modal = document.getElementById("popupModalBonus");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

async function getMerk() {
  try {
    const response = await fetch('/api/barang/merk_choices/')
    const choices = await response.json()

    const select = document.getElementById("merk")

    let selectedMerk = select.dataset.selectedMerk

    choices.forEach(choice => {
      let option = document.createElement("option")
      option.value = choice.value
      option.textContent = choice.label
      if (choice.value === selectedMerk.toLowerCase()) {
        option.selected = true
        const placeholder = select.querySelector('option[value=""]')
        if (placeholder) placeholder.removeAttribute('selected')
      }
      select.appendChild(option)
    })
  } catch (err) {
    console.error(err)
  }
}
