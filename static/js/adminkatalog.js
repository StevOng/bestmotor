document.addEventListener('DOMContentLoaded', () => {
    getTipe()
})

//   {% comment %} tabel katalog {% endcomment %}
$(document).ready(function () {
    let table = $('#tabelKatalog').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        autoWidth: false,
        ordering: false,
        scrollX: true,
        responsive: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2, -3] } // isi field di tengah
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#tableSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

//   {% comment %} copy link {% endcomment %}
document.getElementById("copyButton").addEventListener("click", function () {
    const linkText = document.getElementById("linkText").textContent;
    navigator.clipboard.writeText(linkText).then(() => {
        const tooltip = document.getElementById("copyTooltip");
        tooltip.classList.remove("opacity-0");
        setTimeout(() => {
            tooltip.classList.add("opacity-0");
        }, 1500);
    }).catch(err => {
        console.error("Gagal menyalin teks: ", err);
    });
});

document.getElementById("toggleCheck")?.addEventListener("click", function () {
    document.getElementById("checkIcon").classList.toggle("hidden");
});

function confirmPopupBtn(id) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/katalog/${id}/`, {
                method: "DELETE"
            })
            if (response.ok) {
                console.log("Katalog berhasil dihapus");
                document.querySelector(`button[onclick="confirmPopupBtn(${id})"]`).closest("tr").remove()
            } else {
                console.error("Gagal menghapus Katalog");
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

async function getTipe() {
    try{
        const response = await fetch('/api/barang/tipe_choices/')
        const choices = await response.json()

        const select = document.getElementById("tipe-mtr")
        // select.innerHTML = '<option value="" disabled>Masukkan tipe motor</option>';
        choices.forEach(choice => {
            let option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label
            select.appendChild(option)
        })
        let selectedTipe = "{{ barang.tipe|default:'' }}"
        if (selectedTipe) {
            select.value = selectedTipe
        }
    } catch(err) {
        console.error(err);
    }
}

document.getElementById("tableSearch").addEventListener("input", async function () {
    const query = this.value.trim();
    const resultsContainer = document.getElementById("searchResults");

    if (query.length === 0) {
        resultsContainer.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`/api/katalog/?search=${query}`);
        const data = await response.json();

        resultsContainer.innerHTML = "";

        data.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.barang_nama || "Barang Tidak Diketahui";
            li.className = "p-2 hover:bg-gray-200 cursor-pointer";
            resultsContainer.appendChild(li);
        });
    } catch (err) {
        console.error("Fetch error:", err);
    }
});