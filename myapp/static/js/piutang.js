function confirmPopupBtn(id) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/piutang/${id}/`, {
                method: "DELETE",
            })
            if (response.ok) {
                console.log("Piutang pembelian berhasil dihapus");
                const row = document.querySelector(`tr[data-id="${id}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
            } else {
                console.error("Gagal menghapus piutang pembelian");
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

document.getElementById("searchPiutang").addEventListener("input", function() {
    const searchValue = this.value.toLowerCase()
    const row = document.querySelectorAll('#allpiutang tbody tr')

    row.forEach(row => {
        const noBukti = row.querySelector('.no-bukti').textContent.toLowerCase()
        if (noBukti.includes(searchValue)) {
            row.style.display = ""
        } else {
            row.style.display = "none"
        }
    })
})