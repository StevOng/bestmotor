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
console.log("BarangData global:", window.barangData)

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

$(document).ready(function () {
    $('#detailBrg').DataTable({
        pageLength: 20,
        lengthChange: false,
        ordering: false,
        scrollX: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] } // kolom 8 dan 9 di tengah
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();
});

document.querySelectorAll(".input_hrgbrg").forEach(input => {
    input.addEventListener("input", callListener)
})

document.querySelectorAll(".input_qtybrg").forEach(input => {
    input.addEventListener("input", callListener)
})

document.querySelectorAll(".disc").forEach(input => {
    input.addEventListener("input", callListener)
})

document.getElementById("ppn").addEventListener("input", callListener)

document.getElementById("ongkir").addEventListener("input", callListener)

document.getElementById("discount").addEventListener("input", callListener)

document.getElementById("top").addEventListener("input", callListener)

function tanggalTop() {
    const topInput = document.getElementById("top")
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

document.getElementById("toggleCheck")?.addEventListener("click", function () {
    document.getElementById("checkIcon").classList.toggle("hidden");
});

function confirmPopupBtn(attr) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = async function () {
        const row = attr.closest("tr")
        row.querySelectorAll("input, select, textarea").forEach((el) => {
            el.value = ""
            if (el.tagName == "select") {
                el.selectedIndex = 0
            }
        })
        row.querySelectorAll("td").forEach((td, i) => {
            if (i == 2) td.textContent = ""
        })
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
        console.log("BarangId:", barangId, "BarangData:", barangData[barangId]);

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
        let response = await fetch('/api/pesanan/kurir_choices/')
        let choices = await response.json()

        let select = document.getElementById("kurir")
        let selectedKurir = select.dataset.selectedKurir

        choices.forEach(choice => {
            let option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label
            select.appendChild(option)
        })
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

    let hiddenInput = document.getElementById("customerId")
    if (hiddenInput) {
        hiddenInput.value = id
    }
    console.log(`id customer yang dipilih: ${hiddenInput.value} atau ${id}`)
    closeModal()
}

async function submitDetail() {
    const id = document.getElementById("pesananId")?.value
    const qtys = Array.from(document.querySelectorAll(".input_qtybrg")).map(input => parseInt(input.value)).filter(val => !isNaN(val))
    const diskonBarangs = Array.from(document.querySelectorAll(".disc")).map(input => parseFloat(input.value)).filter(val => !isNaN(val))
    const barangIds = Array.from(document.querySelectorAll(".barangId")).map(input => parseInt(input.value)).filter(val => !isNaN(val))
    const kurir = document.getElementById("kurir").value
    const noRef = document.getElementById("no_referensi").value
    const customer = document.getElementById("customerId")?.value
    const top = document.getElementById("top").value
    const alamat = document.getElementById("alamat_kirim").value
    const keterangan = document.getElementById("keterangan").value
    const ppn = document.getElementById("ppn").value
    const ongkir = document.getElementById("ongkir").value
    const diskon = document.getElementById("discount").value

    if (!customer || !barangIds) {
        alert("Customer dan Barang harus dipilih")
        console.log(`customerId: ${customer}, barangId: ${barangIds}`)
        return
    }
    const method = id ? "PUT" : "POST";
    const apiUrl = id ? `/api/pesanan/${id}/` : `/api/pesanan/`
    const csrfToken = getCSRFToken()
    try {
        const detail_barang = barangIds.map((barangId, index) => ({
            barang_id: barangId,
            qty_pesan: qtys[index],
            diskon_barang: diskonBarangs[index]
        }))
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                "customer_id": customer,
                "no_referensi": noRef,
                "kurir": kurir,
                "top": top,
                "ppn": ppn,
                "ongkir": ongkir,
                "diskon_pesanan": diskon,
                "alamat_kirim": alamat,
                "keterangan": keterangan,
                "detail_barang": detail_barang
            })
        })
        const result = await response.json()
        if (response.ok) {
            console.log("Pesanan & Detail berhasil disimpan:", result);
            setTimeout(() => {
                location.replace(`/pesanan/`);
            }, 1000);
        } else {
            console.error("Gagal:", result);
            alert("Gagal menyimpan pesanan: " + JSON.stringify(result));
        }
    } catch (error) {
        console.error("Terjadi kesalahan: ", error)
    }
}

async function loadBarangOptions(selectId, selectedId) {
    let response = await fetch("/api/barang/")
    let data = await response.json()
    let select = document.getElementById(selectId)
    select.innerHTML = "<option disabled selected>Pilih Barang</option>"

    data.forEach(barang => {
        let option = document.createElement("option")
        option.value = barang.id
        option.text = `${barang.kode_barang} - ${barang.nama_barang}`
        if (selectedId !== null && selectedId !== "" && barang.id == selectedId) {
            option.selected = true
        }
        select.appendChild(option)
    })
}

async function getOptionBrg() {
    const selects = document.querySelectorAll("[id^='kodebrg-dropdown-']")
    selects.forEach(select => {
        const namaBrgId = select.dataset.namaBarangId
        loadBarangOptions(select.id, select.value)

        select.addEventListener("change", async () => {
            const barangId = select.value
            const row = select.closest('tr')
            const hiddenInput = row.querySelector(".barangId")
            if (hiddenInput) {
                hiddenInput.value = barangId
            }

            const response = await fetch(`/api/barang/${barangId}/`)
            const data = await response.json()

            const namaBrgEl = document.getElementById(namaBrgId)
            if (namaBrgEl && data.nama_barang) {
                namaBrgEl.textContent = data.nama_barang
            }
            const hargaInput = row.querySelector(".input_hrgbrg")
            if (hargaInput) {
                hargaInput.value = data.harga_jual
            }
            updateDetailBiaya()

            // Cek apakah ini baris terakhir → baru tambahkan baris baru
            const allRows = document.querySelectorAll("tbody tr");
            const isLast = row === allRows[allRows.length - 1];
            if (isLast) {
                addNewRow();
            }
        })
    })
}

function addNewRow(detail = null) {
    const tbody = document.querySelector("#detailBrg tbody");
    const newRow = document.createElement("tr");

    const rowCount = tbody.querySelectorAll("tr").length + 1;

    const selectId = `kodebrg-dropdown-${rowCount}`;
    const barangId = detail?.barang_id || ""

    newRow.classList.add("new-row-added");
    newRow.innerHTML = `
      <td>${rowCount}</td>
      <td>
        <input type="hidden" name="barangId-${rowCount}" class="barangId" value="${barangId}">
        <select id="${selectId}" class="kodebrg-dropdown" data-nama-barang-id="namaBrg-${rowCount}" data-selected-id="${barangId}">
          <option value="">Pilih Barang</option>
        </select>
      </td>
      <td class="kode-terpilih hidden"></td>
      <td id="namaBrg-${rowCount}">${detail?.barang_id?.nama_barang || ""}</td>
      <td><input type="number" value="${detail?.barang_id?.harga_jual || 0}" class="input_hrgbrg rounded-md border-gray-300"/></td>
      <td><input type="number" value="${detail?.qty_pesan || 0}" class="input_qtybrg w-20 rounded-md border-gray-300"/></td>
      <td><input type="number" value="${detail?.diskon_barang || 0}" class="disc w-20 rounded-md border-gray-300"/></td>
      <td class="totalDisc">${detail?.total_diskon_barang || ""}</td>
      <td class="totalHarga">${detail?.total_harga_barang || ""}</td>
      <td><button type="button" onclick="submitDetail()" class="btn-submit"><i class="btn-simpan fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
      <td><button type="button" onclick="hapusRow(this)"><i class="btn-hapus fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);

    // deferring execution
    setTimeout(() => {
        loadBarangOptions(selectId, barangId);
        getOptionBrg();
    }, 0);

    newRow.querySelector(".input_hrgbrg").addEventListener("input", callListener)
    newRow.querySelector(".input_qtybrg").addEventListener("input", callListener)
    newRow.querySelector(".disc").addEventListener("input", callListener)
}


function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}

function minusCheck() {
    const allInput = document.querySelectorAll("input")
    allInput.forEach(input => {
        if (input.type == "number" && input.value < 0) {
            alert("Nilai tidak boleh minus")
            input.value = null
            updateDetailBiaya()
            return
        }
    })
}

function qtyCheck() {
    const row = document.querySelectorAll("#detailBrg tbody tr")
    row.forEach(async (input) => {
        const inputQty = input.querySelector(".input_qtybrg")
        const rowQty = inputQty.value
        const rowId = input.querySelector(".barangId").value
        const data = await fetch(`/api/barang/${rowId}/`)
        const res = await data.json()

        if (rowQty > res.stok) {
            alert(`Stok tidak mencukupi untuk pesanan, sisa stok tinggal ${res.stok}`)
            inputQty.value = res.stok
            updateDetailBiaya()
            return
        }
    })
}

function callListener() {
    minusCheck()
    qtyCheck()
    updateDetailBiaya()
    tanggalTop()
}