function confirmPopupBtn(returId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/returbeli/${returId}/`, {
                method: "DELETE"
            })
            if (response.ok) {
                const result = await response.json()
                const row = document.querySelector(`tr[data-id="${returId}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
                console.log(result)
            } else {
                console.error("Gagal menghapus returan")
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

document.getElementById("searchRetur").addEventListener("input", function() {
    const searchValue = this.value.toLowerCase()
    const row = document.querySelectorAll('#allReturan tbody tr')

    row.forEach(row => {
        const noBukti = row.querySelector('.noBukti').textContent.toLowerCase()
        if (noBukti.includes(searchValue)) {
            row.style.display = ""
        } else {
            row.style.display = "none"
        }
    })
})