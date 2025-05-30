document.addEventListener('DOMContentLoaded', () => {
    getOptionBrg()

    const tanggal = document.getElementById("tanggal_inv")
    const today = new Date()
    const year = String(today.getFullYear())
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formatDate = `${day}/${month}/${year}`

    tanggal.value = formatDate
})

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

function confirmPopupBtn(returId) {
    const modal = document.getElementById("popupModalConfirm");
    modal.classList.remove("hidden"); // Tampilkan modal
    modal.style.display = "flex"; // Pastikan tampil dengan flexbox

    const confirmButton = document.getElementById("confirmAction");

    confirmButton.onclick = function () {
        const row = document.querySelector(`tr[data-id=${returId}]`)
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

async function loadBarangOptions(selectId, selectedId = null) {
    let response = await fetch("/api/barang/")
    let data = await response.json()
    let select = document.getElementById(selectId)
    select.innerHTML = "<option disabled selected>Pilih Barang</option>"

    data.forEach(barang => {
        let option = document.createElement("option")
        option.value = barang.id
        option.text = barang.kode_barang
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
        const namaBrgId = select.dataset.namaBrg
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
          <input type="hidden" name="barangId" class="barangId" value="${re?.barang_id||""}">
          <select id="kodebrg-dropdown-${rowCount}" class="kodebrg-dropdown" data-namaBrg="namaBrg-${rowCount}" data-selected-id="${re?.barang_id||""}">
            <option value="${re?.barang_id||""}" selected>${re?.barang_id.kode_barang||""} - ${re?.barang_id.nama_barang||""}</option>
          </select>
        </td>
        <td id="namaBrg-${rowCount}">
          ${re?.barang_id.nama_barang||""}
        </td>
        <td><input type="number" value="${re?.harga_beli||""}" id="input_hrgbrg-${rowCount}" class="input_hrgbrg w-full rounded-md border-gray-300" /></td>
        <td><input type="number" value="${re?.qty_retur||""}" id="input_qtybrg-${rowCount}" class="input_qtybrg w-20 rounded-md border-gray-300" /></td>
        <td><input type="number" value="${re?.diskon_barang||""}" id="disc-${rowCount}" class="disc w-20 rounded-md border-gray-300" /></td>
        <td class="totalDisc">${re?.total_diskon_barang||""}</td>
        <td class="total">${re?.total_harga_barang||""}</td>
        <td><button type="submit" data-id=""><i class="fa-regular fa-floppy-disk text-2xl text-customBlue"></i></button></td>
        <td><button onclick="hapusRow(this)"><i class="fa-regular fa-trash-can text-2xl text-red-500"></i></button></td>
    `

    tbody.appendChild(newRow);

    const btnSubmit = newRow.querySelector(".btn-submit")
    if (re?.id) {
        btnSubmit.setAttribute("data-id", re.id)
    }

    loadBarangOptions(`kodebrg-dropdown-${rowCount}`, re?.barang_id || null);
}

function hapusRow(btn) {
    const row = btn.closest("tr")
    row.classList.add("fade-out")
    setTimeout(() => row.remove(), 400)
}

function pilihInv(id, nomor, cust) {
    let displayTextNomor = `${nomor}`
    let displayTextSupplier = `${cust}`

    let hiddenInput = document.getElementById("fakturId")
    if (hiddenInput) {
        hiddenInput.value = id
        document.getElementById("no_faktur").value = displayTextNomor
        document.getElementById("customer").value = displayTextSupplier
    }
    closeModalConfirm()
}

document.querySelectorAll(".btn-submit").forEach((btn) => {
    btn.addEventListener("submit", async (event) => {
        event.preventDefault();

        const row = btn.closest("tr")
        const barangId = row.querySelector(".barangId").value
        const qtyRetur = row.querySelector("[id^='input_qtybrg-']").value
        const hrgBrg = row.querySelector("[id^='input_hrgbrg-']").value
        const disc = row.querySelector("[id^='disc-']").value
        const id = document.getElementById("hiddenId").value
        const fakturId = document.getElementById("fakturId").value
        const pesananId = document.getElementById("pesananId").value
        const bruto = document.getElementById("bruto").value
        const ongkir = document.getElementById("ongkir").value
        const ppn = document.getElementById("ppn").value
        const discount = document.getElementById("discount").value
        const nilaiPpn = ppn * ((qtyRetur * hrgBrg) - disc)
        const check = await fetch(`/api/detailpesanan/${pesananId}/`)
        const data = await check.json()

        if (!barangId || !pesananId) {
            alert("Barang dan faktur harus dipilih");
            return;
        }

        if (qtyRetur > data.qty_beli) {
            alert("Kuantiti retur melebihi stok pesanan")
            return
        }

        const retur = new FormData()
        retur.append("faktur_id", fakturId)
        retur.append("subtotal", bruto)

        const method = id ? "PATCH" : "POST";
        const apiUrl = id ? `/api/returjual/${id}/`:`/api/returjual/`
        try {
            const response = await fetch(apiUrl, {
            method: method,
            body: retur
            })
            if (response.ok) {
                const patchInv = await fetch(`/api/pesanan/${pesananId}/`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        bruto: (qtyRetur * hrgBrg),
                        nilai_ppn: nilaiPpn,
                        netto: bruto + nilaiPpn + ongkir - discount,
                    })
                }) 
                const patchDetail = await fetch(`/api/detailpesanan/${pesananId}/`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        qty_retur: qtyRetur
                    })
                })
                if (patchInv.ok && patchDetail.ok) {
                    const response1 = await patchInv.json()
                    const response2 = await patchDetail.json()
                    console.log(response1, response2);
                } else {
                    console.log("Terjadi kesalahan saat PATCH pesanan detailpesanan")
                }
            } else {
                console.log(`Gagal ${method} ke ${apiUrl}`)
            }
        } catch (error) {
            console.error("Terjadi kesalahan: ", error)
        }
    });
});

document.querySelectorAll("tr").forEach(row => {
    const inputQty = row.querySelector(".input_qtybrg");
    const inputHarga = row.querySelector(".input_hrgbrg");
    const inputDiskon = row.querySelector(".disc");
    const totalDiscEl = row.querySelector(".totalDisc");
    const totalHargaEl = row.querySelector(".total");
    const barangId = row.querySelector(".barangId")?.value;
    const barangData = window.barangData
  
    if (!barangId || !inputQty || !inputHarga) return;
  
    const updateHarga = () => {
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
    };
  
    inputQty.addEventListener("input", updateHarga);
    inputDiskon.addEventListener("input", updateHarga);
});