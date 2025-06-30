document.addEventListener('DOMContentLoaded', () => {
    getTipe()
    const rows = document.querySelectorAll("#isKatalogUtama");

    rows.forEach((input, index) => {
        const icon = input.closest("td").querySelector("#checkIcon");
        if (input.value === "true" || input.value === "True") {
            icon.classList.remove("hidden");
        }
    });
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

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

function confirmPopupBtn(id) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");
    const csrfToken = getCSRFToken()

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/katalog/${id}/`, {
                method: "DELETE",
                headers: {
                    'X-CSRFToken': csrfToken
                }
            })
            if (response.ok) {
                console.log("Katalog berhasil dihapus");
                showSuccessToast("Berhasil", "Berhasil menghapus data")
                document.querySelector(`button[onclick="confirmPopupBtn(${id})"]`).closest("tr").remove()
            } else {
                console.error("Gagal menghapus Katalog");
                showWarningToast("Gagal", "Gagal menghapus data")
            }
        } catch (error) {
            console.error("Terjadi kesalahan: ", error);
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

async function getTipe() {
    try {
        const response = await fetch('/api/barang/tipe_choices/')
        const choices = await response.json()

        const select = document.getElementById("tipe-mtr")
        let selectedTipe = select.dataset.selectedTipe
        choices.forEach(choice => {
            let option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label
            if (choice.value === selectedTipe.toLowerCase()) {
                option.selected = true
                const placeholder = select.querySelector('option[value=""]')
                if (placeholder) placeholder.removeAttribute('selected')
            }
            select.appendChild(option)
        })
    } catch (err) {
        console.error(err);
    }
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