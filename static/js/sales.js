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
  });
  $('.dt-search').remove();
  $('.dt-info').remove();

  $('#tableSearch').on('keyup', function () { //search
    let searchValue = $(this).val();
    table.search(searchValue).draw();
  });
});

$(document).ready(function () {
  let table = $('#tabelDetailBonus').DataTable({
    pageLength: 5,
    lengthChange: false, // Hilangkan "Show entries"
    ordering: false,
    scrollX: true,
  });
  $('.dt-search').remove();
  $('.dt-info').remove();

  $('#bonusDetailSearch').on('keyup', function () { //search
    let searchValue = $(this).val();
    table.search(searchValue).draw();
  });
});

//PopupModal
function openModal() {
  let modal = document.getElementById("popupModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  let modal = document.getElementById("popupModal");
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
