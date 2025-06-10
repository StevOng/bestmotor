document.addEventListener('DOMContentLoaded', () => {
    getKurir()
    getOptionBrg()

    const tanggal = document.getElementById("tanggal")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate
})

$(document).ready(function () {
    let table = $('#detailBrg').DataTable({
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

    $('#tableSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

document.addEventListener("change", function (e) {
    if (e.target.classList.contains("kodebrg-dropdown")) {
        const lastRow = document.querySelector("tbody tr:last-child");
        const selectedValue = e.target.value;

        // Cek apakah dropdown dipilih dan belum pernah nambah baris baru
        if (selectedValue && !lastRow.classList.contains("new-row-added")) {
            addNewRow();
        }
    }
});

document.querySelectorAll(".input_hrgbrg").forEach(input => {
    input.addEventListener("input", updateDetailBiaya)
})

document.querySelectorAll(".input_qtybrg").forEach(input => {
    input.addEventListener("input", updateDetailBiaya)
})

document.querySelectorAll(".disc").forEach(input => {
    input.addEventListener("input", updateDetailBiaya)
})

document.getElementById("ppn").addEventListener("input", updateDetailBiaya)

document.getElementById("ongkir").addEventListener("input", updateDetailBiaya)

document.getElementById("discount").addEventListener("input", updateDetailBiaya)

document.getElementById("top").addEventListener("input", tanggalTop)

function tanggalTop() {
    const topInput = document.getElementById("top_inv")
    const jtoInput = document.getElementById("jatuh_tempo")

    const top = parseInt(topInput.value)
    let today = new Date()
    let jatuhTempo = new Date(today);
    jatuhTempo.setDate(today.getDate() + top);

    const yjto = jatuhTempo.getFullYear();
    const mjto = String(jatuhTempo.getMonth() + 1).padStart(2, "0");
    const djto = String(jatuhTempo.getDate()).padStart(2, "0");

    let formattedDate = `${djto}/${mjto}/${yjto}`;

    if (formattedDate) {
        jtoInput.value = formattedDate
    } else {
        jtoInput.value = "dd/mm/yyyy"
    }
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

// const searchKode = document.getElementById("searchKode");
// const dropdownList = document.getElementById("dropdownList");

// // Sembunyikan dropdown jika klik di luar
// document.addEventListener("click", (event) => {
//     if (!searchKode.contains(event.target) && !dropdownList.contains(event.target)) {
//         dropdownList.classList.add("hidden");
//     }
// });

// // Pilih item dan isi input
// function selectKode(element) {
//     searchKode.value = element.textContent;
//     dropdownList.classList.add("hidden");
// }

document.getElementById("toggleCheck")?.addEventListener("click", function () {
    document.getElementById("checkIcon").classList.toggle("hidden");
});

function confirmPopupBtn(detailId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
        const row = document.querySelector(`tr[data-id="${detailId}"]`);
        row.querySelectorAll("input, select, textarea").forEach((el) => {
            el.value = ""
            if (el.tagName == "select") {
                el.selectedIndex = 0
            }
        })
        row.removeAttribute("data-id")
        closeModalConfirm();
    };
}

function closeModalConfirm() {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.add("hidden"); // Sembunyikan modal
    modal.style.display = "none"; // Pastikan modal benar-benar hilang
}

// update harga secara dinamis
function updateDetailBiaya() {
    let bruto = 0
    const brutoEl = document.getElementById("bruto")
    const ppnInput = document.getElementById("ppn")
    const ongkirInput = document.getElementById("ongkir")
    const discInvInput = document.getElementById("discount")
    const niliaPpnEl = document.getElementById("nilai_ppn")
    const nettoEl = document.getElementById("netto")
    document.querySelectorAll("tr").forEach(row => {
        const inputQty = row.querySelector(".input_qtybrg");
        const inputHarga = row.querySelector(".input_hrgbrg");
        const inputDiskon = row.querySelector(".disc");
        const totalDiscEl = row.querySelector(".totalDisc");
        const totalHargaEl = row.querySelector(".totalHarga");
        const barangId = row.querySelector(".barangId")?.value;
        const barangData = window.barangData

        if (!barangId || !inputQty || !inputHarga) return;

        const qty = parseInt(inputQty.value) || 0;
        const diskon = parseFloat(inputDiskon.value) || 0;
        const barang = barangData[barangId];

        if (!barang) return;

        let harga = barang.harga_jual;
        if (qty >= barang.min_qty_grosir) {
            harga = barang.harga_satuan;
        } else {
            harga = barang.harga_jual;
        }

        inputHarga.value = harga;

        const totalDiskon = harga * qty * (diskon / 100);
        const totalHarga = harga * qty - totalDiskon;

        totalDiscEl.textContent = totalDiskon.toFixed(2);
        totalHargaEl.textContent = totalHarga.toFixed(2);
        bruto += totalHarga
    });
    brutoEl.value = bruto
    const nilaiPpn = bruto * (ppnInput.value / 100)
    const netto = bruto + nilaiPpn + Number(ongkirInput.value) - discInvInput.value

    niliaPpnEl.value = nilaiPpn
    nettoEl.value = netto
}

async function getKurir() {
    try {
        let response = await fetch('/api/detailpesanan/kurir_choices/')
        let choices = await response.json()

        let select = document.getElementById("kurir")

        choices.forEach(choice => {
            let option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label
            select.appendChild(option)
        })
        let selectedKurir = "{{ detail_pesanan.merk|default:'' }}"
        if (selectedKurir) {
            select.value = selectedKurir
        }
    } catch (error) {
        console.error(error);
    }
}

function pilihCustomer(id, nama, toko) {
    let displayText = `${toko} - ${nama}`

    document.getElementById("customer").value = displayText

    let hiddenInput = document.getElementById("customer_id")
    if (hiddenInput) {
        hiddenInput.value = id
    }
    closeModal()
}

document.querySelectorAll(".btn-submit").forEach((btn) => {
    btn.addEventListener("submit", async (event) => {
        event.preventDefault()

        const row = btn.closest("tr")
        const id = btn.dataset?.id || null
        const qty = row.querySelector(".input_qtybrg").value
        const diskonBarang = row.querySelector(".disc").value
        const barangId = row.querySelector(".barangId")?.value || null
        const kurir = document.getElementById("kurir").value
        const customer = document.getElementById("customerId")?.value || null
        const top = document.getElementById("top").value
        const alamat = document.getElementById("alamat_kirim").value
        const keterangan = document.getElementById("keterangan").value
        const ppn = document.getElementById("ppn").value
        const ongkir = document.getElementById("ongkir").value
        const diskon = document.getElementById("discount").value

        if (!customer || !barangId) {
            alert("Customer dan Barang harus dipilih")
            return
        }
        const pesanan = new FormData()
        pesanan.append("customer_id", customer)
        pesanan.append("ppn", ppn)
        pesanan.append("ongkir", ongkir)
        pesanan.append("diskon_pesanan", diskon)

        const method = id ? "PATCH" : "POST" // jika ada id edit, tidak? tambah
        const apiPesanan = id ? `/api/pesanan/${id}/` : `/api/pesanan/`
        const apiDetail = id ? `/api/detailpesanan/${id}/` : `/api/detailpesanan/`

        const response = await fetch(apiPesanan, {
            method: method,
            body: pesanan
        })
        const pesananData = await response.json()
        console.log(pesananData);

        if (pesananData.id) {
            const detailPesanan = new FormData()
            detailPesanan.append("pesanan_id", pesananData.id)
            detailPesanan.append("barang_id", barangId)
            detailPesanan.append("kurir", kurir)
            detailPesanan.append("top", top)
            detailPesanan.append("alamat_kirim", alamat)
            detailPesanan.append("keterangan", keterangan)
            detailPesanan.append("qty_pesan", qty)
            detailPesanan.append("diskon_barang", diskonBarang)

            let detailResponse = await fetch(apiDetail, {
                method: method,
                body: detailPesanan
            })
            let detailData = await detailResponse.json()
            console.log(detailData);
        }
    })
})

async function loadBarangOptions(selectId, selectedId = null) {
    let response = await fetch("/api/barang/")
    let data = await response.json()
    let select = document.getElementById(selectId)
    select.innerHTML = "<option disabled selected>Pilih Barang</option>"

    data.forEach(barang => {
        let option = document.createElement("option")
        option.value = barang.id
        option.text = `${barang.kode_barang} - ${barang.nama_barang}`
        if (barang.id == selectedId) {
            option.selected = true
        }
        select.appendChild(option)
    })
}

async function getOptionBrg() {
    const selects = document.querySelectorAll("[id^='kodebrg-dropdown-']")
    selects.forEach(select => {
        const selectedId = select.dataset.selectedId
        const namaBrgId = select.dataset.namaBarangId
        loadBarangOptions(select.id, selectedId)

        select.addEventListener("change", async () => {
            const barangId = select.value

            const response = await fetch(`/api/barang/${barangId}`)
            const data = await response.json()

            const namaBrgEl = document.getElementById(namaBrgId)
            if (namaBrgEl && data.nama_barang) {
                namaBrgEl.textContent = data.nama_barang
            }
        })
    })
}

function addNewRow() {
    const tbody = document.querySelector("tbody");
    const newRow = document.createElement("tr");

    const rowCount = tbody.querySelectorAll("tr").length + 1;

    newRow.classList.add("new-row-added"); // untuk mencegah nambah berkali-kali
    newRow.innerHTML = `
      <td>${rowCount}</td>
      <td>
        <input type="hidden" name="barangId-${rowCount}" class="barangId" value="${detail?.barang_id || ""}">
        <select id="kodebrg-dropdown-${rowCount}" class="kodebrg-dropdown" data-nama-barang-id="namaBrg-${rowCount}" data-barang-id="${detail?.barang_id || ""}">
          <option value="">Pilih Barang</option>
        </select>
      </td>
      <td class="kode-terpilih"></td>
      <td id="namaBrg-${rowCount}">${detail?.barang_id.nama_barang || ""}</td>
      <td><input type="number" id="input_hrgbrg-${rowCount}" value="${detail?.barang_id.harga_jual || ""}" class="input_hrgbrg w-full rounded-md border-gray-300"/></td>
      <td><input type="number" id="input_qtybrg-${rowCount}" value="${detail?.qty_pesan || ""}" class="input_qtybrg w-20 rounded-md border-gray-300"/>${detail?.qty_pesan || ""}</td>
      <td><input type="number" id="disc-${rowCount}" value="${detail?.diskon_barang || ""}" class="disc w-20 rounded-md border-gray-300"/></td>
      <td id="totalDisc-${rowCount}" class="totalDisc">${detail?.total_diskon_barang || ""}</td>
      <td id="totalHarga-${rowCount}" class="totalHarga">${detail?.total_harga_barang || ""}</td>
      <td><button type="submit" class="btn-submit" data-id=""><i class="btn-simpan fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
      <td><button onclick="hapusRow(this)"><i class="btn-hapus fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);

    const btnSubmit = newRow.querySelector(".btn-submit")
    if (detail?.id) {
        btnSubmit.setAttribute("data-id", detail.id)
    }

    loadBarangOptions(`kodebrg-dropdown-${rowCount}`, detail?.barang_id || null);
}

function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}