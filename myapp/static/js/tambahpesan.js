document.addEventListener("DOMContentLoaded", function () {
    let today = new Date().toISOString().split('T')[0]
    document.getElementById("tanggal").value = today
})

// ubah input, texfield dan select tag jadi readonly jika dalam mode lihat
document.addEventListener('DOMContentLoaded', function () {
    const mode = "{{ mode }}"
    if (mode === 'lihat') {
        document.querySelectorAll('input, textarea, select').forEach(element => {
            if (!element.readOnly) {
                element.readOnly = true
                element.classlist.add('bg-gray-200')
            }
        })
        document.querySelectorAll('button').forEach(button => {
            if (button.type !== 'button') {
                button.disabled = true
            }
        })
    }
})

document.querySelector('.btn-simpan').addEventListener('click', function() {
    // Ambil data dari form
    const data = {
        customer_id: document.getElementById('customer_id').value,
        top: document.getElementById('top').value,
        jatuh_tempo: document.getElementById('jatuh_tempo').value,
        alamat_kirim: document.getElementById('alamat_kirim').value,
        keterangan: document.getElementById('keterangan').value,
        ppn: document.getElementById('ppn').value,
        diskon_faktur: document.getElementById('diskon_faktur').value,
        ongkir: document.getElementById('ongkir').value,
        qty_pesanan: document.getElementById('qty_pesanan').value,
        diskon_barang: document.getElementById('diskon_barang').value,
    };

    // Ambil sales_id dari akun yang login (contoh: dari localStorage)
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.sales_id) {
        data.sales_id = userData.sales_id;
    }

    // Ambil barang_id dari tabel detail barang
    const rows = document.querySelectorAll('#detailBrg tbody tr');
    const barangIds = [];
    rows.forEach((row, index) => {
        const barangId = row.querySelector('input[name="barang_id_' + (index + 1) + '"]').value;
        barangIds.push(barangId);
    });
    data.barang_ids = barangIds;

    // Kirim data ke backend
    fetch('/api/simpan-barang/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,  // Gunakan CSRF token yang sudah diambil
        },
        body: JSON.stringify(data),  // Konversi data ke JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Data berhasil disimpan! ID: ' + data.id);
        } else {
            alert('Gagal menyimpan data: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Hapus Barang
document.querySelectorAll('.btn-hapus').forEach(button => {
    button.addEventListener('click', function() {
        const row = this.closest('tr');
        const barang_id = row.querySelector('.kodebrg-dropdown').value;

        fetch(`/api/hapus-barang/${barang_id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  row.remove();
                  alert('Data berhasil dihapus!');
              } else {
                  alert('Gagal menghapus data.');
              }
          });
    });
});

// rumus total disc, total harga, persentase diskon
document.addEventListener('DOMContentLoaded', function() {
    const rows = document.querySelectorAll('#detailBrg tbody tr');

    rows.forEach(row => {
        const hargaInput = row.querySelector('.input_hrgbrg');
        const qtyInput = row.querySelector('.input_qtybrg');
        const discInput = row.querySelector('.disc');
        const totalDiscCell = row.querySelector('.totalDisc');
        const totalHargaCell = row.querySelector('.totalHarga');

        function hitungTotal() {
            const harga = parseFloat(hargaInput.value) || 0;
            const qty = parseFloat(qtyInput.value) || 0;
            const disc = parseFloat(discInput.value) || 0;

            const totalDisc = disc * qty;  // Total diskon = diskon nominal * qty
            const totalHarga = (harga * qty) - totalDisc;  // Total harga = (harga * qty) - total diskon
            const persentaseDiskon = ((disc / harga) * 100).toFixed(2);  // Persentase diskon

            totalDiscCell.textContent = totalDisc.toFixed(2);
            totalHargaCell.textContent = totalHarga.toFixed(2);
            discInput.textContent = `${persentaseDiskon}%`;
        }

        hargaInput.addEventListener('input', hitungTotal);
        qtyInput.addEventListener('input', hitungTotal);
        discInput.addEventListener('input', hitungTotal);

        // Hitung total saat halaman dimuat
        hitungTotal();
    });
});

function updateBarangData(selectElement, index) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const barangId = selectedOption.value;
    const barangKode = selectedOption.text;

    // Update kode dan nama barang di baris yang sesuai
    const row = selectElement.closest('tr');
    row.querySelector('.kode-terpilih').textContent = barangKode;
    row.querySelector('.namaBrg').textContent = 'Nama Barang';  // Ganti dengan nama barang yang sesuai

    // Update input hidden dengan ID barang yang dipilih
    row.querySelector(`input[name="barang_id_${index}"]`).value = barangId;
}

function pilihCustomer(customerNama) {
    // Isi data customer ke form
    document.getElementById('customer').value = customerNama;

    // Tutup modal (jika menggunakan modal)
    const modal = document.getElementById('modalCustomer');
    modal.style.display = 'none';
}

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

$(document).ready(function () {
    let table = $('#modalCustomer').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] } // kolom 8 dan 9 di tengah
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#customerSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

const kodeBarang = ["0001273", "0001274", "0001275", "0001276", "0001277", "0001278"];
const searchKode = document.getElementById("searchKode");
const dropdownList = document.getElementById("dropdownList");

function updateDropdown(filterText = "") {
    let filteredItems = kodeBarang.filter(kode => kode.toLowerCase().includes(filterText.toLowerCase())).slice(0, 3);
    let displayedItems = filteredItems.slice(0, filterText ? filteredItems.length : 3); // Default 3 item, cari semua saat input

    dropdownList.innerHTML = displayedItems
        .map(kode => `<li class="p-2 hover:bg-gray-100 cursor-pointer" onclick="selectKode(this)">${kode}</li>`)
        .join("");

    dropdownList.classList.toggle("hidden", displayedItems.length === 0);
}

// Tampilkan 3 item default saat pertama kali input diklik
searchKode.addEventListener("focus", () => {
    updateDropdown();
});

// Update dropdown berdasarkan pencarian
searchKode.addEventListener("input", () => {
    updateDropdown(searchKode.value);
});

// Sembunyikan dropdown jika klik di luar
document.addEventListener("click", (event) => {
    if (!searchKode.contains(event.target) && !dropdownList.contains(event.target)) {
        dropdownList.classList.add("hidden");
    }
});

// Pilih item dan isi input
function selectKode(element) {
    searchKode.value = element.textContent;
    dropdownList.classList.add("hidden");
}

document.getElementById("toggleCheck").addEventListener("click", function () {
    document.getElementById("checkIcon").classList.toggle("hidden");
});

function confirmPopupBtn() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = function () {
        console.log("Pesanan dihapus!");
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}