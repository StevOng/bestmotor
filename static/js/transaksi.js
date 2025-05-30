function confirmPopupBtnMasuk(id) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async () => {
        try {
            const response = await fetch(`/api/transaksimasuk/${id}/`, {
                method:"DELETE"
            })
            if (response.ok) {
                console.log("Transaksi masuk dihapus!");
                const row = document.querySelector(`tr[data-id="${id}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
            } else {
                console.error("Gagal menghapus objek");
            }
        } catch (error) {
            console.error("error: ", error);
        }
        closeModalConfirm();
    };
}

function confirmPopupBtnKeluar(id) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async () => {
        try {
            const response = await fetch(`/api/transaksikeluar/${id}/`, {
                method: "DELETE"
            })
            if (response.ok) {
                console.log("Transaksi keluar dihapus!");
                const row = document.querySelector(`tr[data-id="${id}"]`)
                row.classList.add("fade-out")
                setTimeout(() => row.remove(), 400)
            } else {
                console.error("Gagal menghapus objek");
            }
        } catch (error) {
            console.error("error: ", error);
        }
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}