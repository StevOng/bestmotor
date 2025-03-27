document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/get-faktur-list/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tableBody = document.querySelector('#modalReturJual tbody');
                tableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi data baru
                data.data.forEach((faktur, index) => {
                    const row = `
                        <tr>
                            <td>${faktur.no_faktur}</td>
                            <td>${faktur.tanggal_faktur}</td>
                            <td>${faktur.no_referensi}</td>
                            <td>${faktur.customer}</td>
                            <td>${faktur.total}</td>
                            <td>
                                <button onclick="selectFaktur('${faktur.no_faktur}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                        <path d="M9.72217 11L12.7222 14L22.7222 4M16.7222 3H8.52217C6.84201 3 6.00193 3 5.3602 3.32698C4.79571 3.6146 4.33677 4.07354 4.04915 4.63803C3.72217 5.27976 3.72217 6.11984 3.72217 7.8V16.2C3.72217 17.8802 3.72217 18.7202 4.04915 19.362C4.33677 19.9265 4.79571 20.3854 5.3602 20.673C6.00193 21 6.84201 21 8.52217 21H16.9222C18.6023 21 19.4424 21 20.0841 20.673C20.6486 20.3854 21.1076 19.9265 21.3952 19.362C21.7222 18.7202 21.7222 17.8802 21.7222 16.2V12" stroke="#3D5A80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                console.error('Gagal mengambil data faktur:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const returId = urlParams.get('returId'); // Ambil returId dari URL (jika dalam mode edit)
    const noFaktur = urlParams.get('no_faktur'); // Ambil no_faktur dari URL (jika dalam mode tambah)

    if (returId) {
        // Mode edit: Ambil data retur berdasarkan returId
        fetch(`/api/get-retur-detail/?returId=${returId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Isi form dengan data retur
                    document.getElementById('no_bukti').value = data.no_bukti;
                    document.getElementById('tanggal_inv').value = data.tanggal;
                    document.getElementById('customer').value = data.customer;
                    document.getElementById('no_faktur').value = data.no_faktur;
                    document.getElementById('no_ref').value = data.no_referensi;
                    document.getElementById('bruto').value = data.bruto;
                    document.getElementById('nilai_ppn').value = data.nilai_ppn;
                    document.getElementById('netto').value = data.netto;
                    document.getElementById('ppn').value = data.ppn;
                    document.getElementById('ongkir').value = data.ongkir;
                    document.getElementById('discount').value = data.diskon_faktur;

                    // Isi tabel detail barang
                    const tableBody = document.querySelector('#detailBrg tbody');
                    tableBody.innerHTML = '';
                    data.barang_retur.forEach((item, index) => {
                        const row = `
                            <tr>
                                <td>${index + 1}</td>
                                <td>
                                    <select class="kodebrg-dropdown">
                                        <option value="${item.barang_id}" selected>${item.kode}</option>
                                    </select>
                                </td>
                                <td>${item.nama}</td>
                                <td><input type="number" value="${item.harga}" class="input_hrgbrg" /></td>
                                <td><input type="number" value="${item.qty_retur}" class="input_qtybrg" oninput="validateQtyRetur(this, ${item.qty_pesanan})" /></td>
                                <td><input type="number" value="${item.diskon_barang}" class="disc" /></td>
                                <td>${item.diskon_barang * item.qty_retur}</td>
                                <td>${(item.harga - item.diskon_barang) * item.qty_retur}</td>
                                <td><button onclick="saveRetur()"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
                                <td><button onclick="confirmPopupBtn(${item.barang_id})"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
                            </tr>
                        `;
                        tableBody.insertAdjacentHTML('beforeend', row);
                    });
                } else {
                    alert('Gagal mengambil data retur: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else if (noFaktur) {
        // Mode tambah: Ambil data faktur berdasarkan no_faktur
        fetch(`/api/get-faktur-detail/?no_faktur=${noFaktur}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Isi form dengan data faktur
                    document.getElementById('no_faktur').value = data.no_faktur;
                    document.getElementById('no_ref').value = data.no_referensi;
                    document.getElementById('customer').value = data.customer;
                    document.getElementById('tanggal_inv').value = data.tanggal_faktur;
                    document.getElementById('ppn').value = data.ppn;
                    document.getElementById('ongkir').value = data.ongkir;
                    document.getElementById('discount').value = data.diskon_faktur;

                    // Isi tabel detail barang
                    const tableBody = document.querySelector('#detailBrg tbody');
                    tableBody.innerHTML = '';
                    data.barang.forEach((item, index) => {
                        const row = `
                            <tr>
                                <td>${index + 1}</td>
                                <td>
                                    <select class="kodebrg-dropdown">
                                        <option value="${item.barang_id}" selected>${item.kode}</option>
                                    </select>
                                </td>
                                <td>${item.nama}</td>
                                <td><input type="number" value="${item.harga}" class="input_hrgbrg" /></td>
                                <td><input type="number" value="0" class="input_qtybrg" oninput="validateQtyRetur(this, ${item.qty_pesanan})" /></td>
                                <td><input type="number" value="${item.diskon_barang}" class="disc" /></td>
                                <td>0</td>
                                <td>0</td>
                                <td><button onclick="saveRetur()"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
                                <td><button onclick="confirmPopupBtn(${item.barang_id})"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
                            </tr>
                        `;
                        tableBody.insertAdjacentHTML('beforeend', row);
                    });
                } else {
                    alert('Gagal mengambil data faktur: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});

function selectFaktur(noFaktur) {
    fetch(`/api/get-faktur-detail/?no_faktur=${noFaktur}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Isi form dengan data faktur yang dipilih
                document.getElementById('no_faktur').value = data.no_faktur;
                document.getElementById('no_ref').value = data.no_referensi;
                document.getElementById('customer').value = data.customer;
                document.getElementById('tanggal_inv').value = data.tanggal_faktur;
                closeModal(); // Tutup modal setelah memilih
            } else {
                alert('Gagal mengambil detail faktur: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function validateQtyRetur(inputQty, maxQty) {
    if (parseInt(inputQty.value) > maxQty) {
        alert('Kuantiti retur tidak boleh melebihi kuantiti pesanan!');
        inputQty.value = maxQty;
    }
}

const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
function saveRetur() {
    const data = {
        no_faktur: document.getElementById('no_faktur').value,
        barang_retur: getBarangReturData(),  // Fungsi untuk mengambil data barang retur dari tabel
        ppn: parseFloat(document.getElementById('ppn').value),
        ongkir: parseFloat(document.getElementById('ongkir').value),
        diskon_faktur: parseFloat(document.getElementById('diskon_faktur').value),
    };

    fetch('/api/simpan-retur/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Tampilkan hasil perhitungan
                document.getElementById('bruto').value = data.bruto.toLocaleString();
                document.getElementById('nilai_ppn').value = data.nilai_ppn.toLocaleString();
                document.getElementById('netto').value = data.netto.toLocaleString();
                alert('Retur berhasil disimpan!');
            } else {
                alert('Gagal menyimpan retur: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    addReturRow()
}

function getBarangReturData() {
    const rows = document.querySelectorAll('#detailBrg tbody tr');
    const barangRetur = [];
    rows.forEach(row => {
        const barangId = row.querySelector('select.kodebrg-dropdown').value;
        const qtyRetur = parseFloat(row.querySelector('.input_qtybrg').value);
        const harga = parseFloat(row.querySelector('.input_hrgbrg').value);
        const diskonBarang = parseFloat(row.querySelector('.disc').value);
        barangRetur.push({
            barang_id: barangId,
            qty_retur: qtyRetur,
            harga: harga,
            diskon_barang: diskonBarang,
        });
    });
    return barangRetur;
}

function deleteBarangRetur() {
    // Jika tabel barang kosong, reset semua inputan dan nilai perhitungan
    const tableBody = document.querySelector('#detailBrg tbody');
    if (tableBody.children.length === 0) {
        // Reset inputan, textarea, dan dropdown
        document.getElementById('no_faktur').value = '';
        document.getElementById('no_ref').value = '';
        document.getElementById('customer').value = '';
        document.getElementById('tanggal_inv').value = '';
        document.getElementById('ppn').value = 0;
        document.getElementById('ongkir').value = 0;
        document.getElementById('diskon_faktur').value = 0;

        // Reset nilai perhitungan
        document.getElementById('bruto').value = 0;
        document.getElementById('nilai_ppn').value = 0;
        document.getElementById('netto').value = 0;
        document.getElementById('discount').value = 0;
    } else {
        // Hitung ulang total, bruto, nilai_ppn, netto, dan diskon
        hitungUlangNilai();
    }

    alert('Barang Retur berhasil dihapus!');
}

function hitungUlangNilai() {
    const rows = document.querySelectorAll('#detailBrg tbody tr');
    let bruto = 0;
    let totalDiskon = 0;

    rows.forEach(row => {
        const harga = parseFloat(row.querySelector('.input_hrgbrg').value) || 0;
        const qty = parseFloat(row.querySelector('.input_qtybrg').value) || 0;
        const diskonBarang = parseFloat(row.querySelector('.disc').value) || 0;

        bruto += (harga - diskonBarang) * qty;
        totalDiskon += diskonBarang * qty;
    });

    const ppn = parseFloat(document.getElementById('ppn').value) || 0;
    const ongkir = parseFloat(document.getElementById('ongkir').value) || 0;
    const diskonFaktur = parseFloat(document.getElementById('diskon_faktur').value) || 0;

    const nilaiPpn = bruto * (ppn / 100);
    const netto = (bruto + nilaiPpn + ongkir) - diskonFaktur;

    // Update nilai di form
    document.getElementById('bruto').value = bruto.toLocaleString();
    document.getElementById('nilai_ppn').value = nilaiPpn.toLocaleString();
    document.getElementById('netto').value = netto.toLocaleString();
    document.getElementById('discount').value = totalDiskon.toLocaleString();
}

function addReturRow() {
    const tableBody = document.querySelector('#detailBrg tbody');
    const newRow = `
        <tr>
            <td>${tableBody.children.length + 1}</td>
            <td><select class="kodebrg-dropdown"></select></td>
            <td>-</td>
            <td><input type="number" class="input_hrgbrg" value="0.00" /></td>
            <td><input type="number" class="input_qtybrg" value="1" /></td>
            <td><input type="number" class="disc" value="0" /></td>
            <td>0</td>
            <td>0,00</td>
            <td><button onclick="saveRetur()"><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
            <td><button onclick="confirmPopupBtn"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
        </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', newRow);
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
    let table = $('#modalReturJual').DataTable({
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

    $('#returJualSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

function confirmPopupBtn() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = function () {
        deleteBarangRetur()
        console.log("Pesanan dihapus!");
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}