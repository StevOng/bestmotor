$(document).ready(function () {
    let table = $('#pesananTunda').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        select: {
            style: 'multi',
            selector: 'td:first-child',
        },
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] }, // kolom 8 dan 9 di tengah
            {
                orderable: false,
                render: DataTable.render.select(),
                targets: 0
            }
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#tableSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

function getCookie(name) {
    let cookieValue = null
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}

function confirmPopupBtn(action) {
    showModalConfirm(action, function () {
        let url, data

        if (action === "delete") {
            url = `/pesanan/${pesananId}/delete/`
            data = {}
        } else if (action === "accept" || action === "sent") {
            url = `/pesanan/${pesananId}/update-status/`
            data = { action: action }
        }

        const csrfToken = getCookie('csrftoken')

        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status == 'success') {
                    alert(data.message)
                    location.reload()
                } else {
                    alert('Gagal melakukan aksi: ' + data.message)
                }
            })
            .catch(error => {
                console.error('Error', error)
                alert('Terjadi kesalahan saat melakukan aksi')
            })
    });
}

function showModalConfirm(actionType, callback) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmTitle = document.getElementById("confirmTitle");
    const confirmMessage = document.getElementById("confirmMessage");
    const confirmButton = document.getElementById("confirmAction");

    if (actionType === "delete") {
        confirmTitle.innerText = "Konfirmasi Hapus";
        confirmMessage.innerText = "Apakah Anda yakin ingin menghapus pesanan ini?";
        confirmButton.innerText = "Hapus";
        confirmButton.classList.replace("bg-green-500", "bg-red-500");
        confirmButton.classList.replace("hover:bg-green-600", "hover:bg-red-600");
    } else if (actionType === "accept") {
        confirmTitle.innerText = "Konfirmasi Terima";
        confirmMessage.innerText = "Apakah Anda yakin ingin menerima pesanan yang terpilih?";
        confirmButton.innerText = "Terima";
        confirmButton.classList.replace("bg-red-500", "bg-green-500");
        confirmButton.classList.replace("hover:bg-red-600", "hover:bg-green-600");
    } else if (actionType === "sent") {
        confirmTitle.innerText = "Konfirmasi Pesanan Terkirim";
        confirmMessage.innerText = "Apakah Anda yakin pesanan terpilih sudah terkirim?";
        confirmButton.innerText = "Iya";
        confirmButton.classList.replace("bg-red-500", "bg-green-500");
        confirmButton.classList.replace("hover:bg-red-600", "hover:bg-green-600");
    }

    confirmButton.onclick = function () {
        callback(); // Jalankan fungsi yang diberikan
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}