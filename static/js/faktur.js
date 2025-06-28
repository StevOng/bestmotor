document.addEventListener('DOMContentLoaded', function () {
    getSales()
})

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

//PopupModal
function openModalExp() {
    let modal = document.getElementById("popupModalExp");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModalExp() {
    let modal = document.getElementById("popupModalExp");
    modal.classList.remove("flex");
    modal.classList.add("hidden");
}

async function getSales() {
    console.log("panggil getSales")
    try {
        const response = await fetch('/api/user/list_sales/')
        console.log(response)
        const choices = await response.json()
        console.log(`data user: ${choices}`)

        const select = document.getElementById("sales-bestmtr")
        const selectedSales = select.dataset.selectedSales
        const inputSalesId = document.getElementById("salesId")

        choices.forEach(choice => {
            const option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label

            if (String(choice.value) === String(selectedSales)) {
                option.selected = true
                inputSalesId.value = choice.value
                const placeholder = select.querySelector('option[value=""]')
                if (placeholder) placeholder.removeAttribute('selected')
            }

            select.appendChild(option)
        })
        select.addEventListener("change", (e) => {
            inputSalesId.value = e.target.value
            console.log("User memilih sales dengan ID:", e.target.value)
        })

    } catch (err) {
        console.error("Error:", err)
    }
}

function exportLaporanPDF() {
    const salesId = document.getElementById("salesId").value;
    const dariTgl = document.getElementById("dari_tgl").value;
    const smpeTgl = document.getElementById("smpe_tgl").value;
    const urlBase = document.getElementById("exportBtn").dataset.url;

    if (!salesId || !dariTgl || !smpeTgl) {
        alert("Mohon isi semua filter terlebih dahulu.");
        return;
    }

    const url = `${urlBase}?salesId=${salesId}&dari_tgl=${dariTgl}&smpe_tgl=${smpeTgl}`;
    console.log("Navigating to:", url);
    window.open(url, "_blank");
}