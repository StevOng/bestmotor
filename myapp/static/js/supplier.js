function confirmPopupBtn(supId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
        try {
            const response = await fetch(`/api/supplier/${supId}/`, {
                method: 'DELETE'
            })
            if (response.ok) {
                console.log("Supplier berhasil dihapus");
                const row = document.querySelector(`tr[data-id="${supId}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
            } else {
                console.error("Gagal menghapus supplier");
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