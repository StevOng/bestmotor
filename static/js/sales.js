document.addEventListener("DOMContentLoaded", () => {
  attachMinusCheck()
  validate()
})

const modalTemplates = {};
document.querySelectorAll('.fixed.inset-0').forEach(modal => {
  modalTemplates[modal.id] = modal.innerHTML;
});

function resetModal(modal) {
  const clone = modal.cloneNode(true);
  modal.parentNode.replaceChild(clone, modal);
  clone.innerHTML = modalTemplates[modal.id];
  return clone;
}

function closeModalById(id) {
  let modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal = resetModal(modal);
}

document.body.addEventListener('click', e => {
  const btn = e.target.closest('[data-close]');
  if (btn) {
    const modal = btn.closest('.fixed.inset-0');
    if (modal && modal.id) closeModalById(modal.id);
  }
});

function showWarningToast(head, msg) {
  const toast = document.getElementById("toastWarning");

  toast.innerHTML = `
    <div class="toast flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-100 shadow-lg">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 id="toastWarnHead" class="text-sm font-medium text-yellow-800">${head}</h3>
          <p id="toastWarnPar" class="mt-1 text-sm text-yellow-600">${msg}</p>
        </div>
        <button onclick="document.getElementById('toastWarning').classList.add('hidden')"  class="ml-auto text-yellow-400 hover:text-yellow-500">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
    </div>
  `

  toast.classList.remove("hidden");

  if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

  toast.toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

function showSuccessToast(head, msg) {
  const toast = document.getElementById("toastSuccess");

  toast.innerHTML = `
      <div class="toast flex items-start p-4 bg-green-50 rounded-lg border border-green-100 shadow-lg">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 id="toastScs" class="text-sm font-medium text-green-800">${head}</h3>
          <p id="toastScsp" class="mt-1 text-sm text-green-600">${msg}</p>
        </div>
        <button onclick="document.getElementById('toastSuccess').classList.add('hidden')"  class="ml-auto text-green-400 hover:text-green-500">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
  `

  toast.classList.remove("hidden");

  if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

  toast.toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
  setTimeout(() => {
    location.reload()
  }, 2000)
}

let barangId = null
let merk_nama = null

$(document).ready(function () {
  let table = $('#tabel-bonus').DataTable({
    pageLength: 20,
    lengthChange: false, // Hilangkan "Show entries"
    autoWidth: false,
    ordering: false,
    scrollX: true,
  });
  $('.dt-search').remove();
  $('.dt-info').remove();

  $('#tableSearch').on('keyup', function () { //search
    let searchValue = $(this).val();
    table.search(searchValue).draw();
  });
});

$(document).ready(function () {
  let table = $('#tabelDetailBonus').DataTable({
    pageLength: 5,
    lengthChange: false, // Hilangkan "Show entries"
    ordering: false,
    scrollX: true,
  });
  $('.dt-search').remove();
  $('.dt-info').remove();

  $('#bonusDetailSearch').on('keyup', function () { //search
    let searchValue = $(this).val();
    table.search(searchValue).draw();
  });
});

function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

function openModalAkun() {
  let modal = document.getElementById("popupModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const action = document.getElementById("popupSetuju")
  const csrfToken = getCSRFToken()

  action.onclick = async function () {
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const nama = document.getElementById("username").value
    const rute = document.getElementById("rute").value
    const role = "sales"

    try {
      const response = await fetch("/api/user/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
          "username": username,
          "password": password,
          "nama": nama,
          "role": role,
          "rute": rute
        })
      })
      const result = await response.json()
      if (response.ok) {
        showSuccessToast("Berhasil", "Data berhasil ditambah")
        console.log(result)
        location.reload()
      } else {
        console.error("error", result)
        showWarningToast("Gagal", "Data gagal ditambahkan")
      }
    } catch (error) {
      console.error(error)
    }
  }
}

function openDetailModal(bonusId) {
  fetch(`/api/bonus/bonus-detail/?bonus_id=${bonusId}`)
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        const tbody = document.getElementById("detailBody");
        tbody.innerHTML = ""; // Kosongkan

        res.data.forEach((item, index) => {
          const row = `
            <tr>
              <td>${index + 1}</td>
              <td>${item.nama_barang}</td>
              <td>${item.merk}</td>
              <td>${item.persen_bonus || 0}%</td>
              <td>${item.qty}</td>
              <td>Rp ${parseInt(item.harga).toLocaleString("en-EN")},-</td>
              <td>Rp ${parseInt(item.nilai_bonus).toLocaleString("en-EN")},-</td>
            </tr>
          `;
          tbody.innerHTML += row;
        });

        // Tampilkan modal
        document.getElementById("popupModal").classList.remove("hidden");
        document.getElementById("popupModal").classList.add("flex");
      }
    })
    .catch(error => {
      console.error("Error fetching bonus detail:", error);
    });
}

//PopupModal
function openModal(id) {
  let modal = document.getElementById("popupModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const confirmAction = document.getElementById("bonusBtn");
  const csrfToken = getCSRFToken();

  confirmAction.onclick = async function () {
    const bonus = document.getElementById("bonus").value;
    try {
      if (!id) {
        const response = await fetch(`/api/persenbonus/`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({
            "barang_id": barangId,
            "merk_nama": merk_nama,
            "persenan": parseFloat(bonus).toFixed(2)
          })
        })
        const result = await response.json()
        if (response.ok) {
          console.log(result)
          showSuccessToast("Berhasil", "Data berhasil ditambahkan")
          location.reload()
        } else {
          console.log("error", result)
        }
      } else {
        const response = await fetch(`/api/persenbonus/${id}/`, {
          method: "PATCH",
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({
            "persenan": parseFloat(bonus).toFixed
          })
        })
        const result = await response.json()
        if (response.ok) {
          console.log(result)
          showSuccessToast("Berhasil", "Data berhasil ditambahkan")
          location.reload()
        } else {
          console.log("error", result)
        }
      }
    } catch (error) {
      showWarningToast("Error", "Terjadi kesalahan")
      console.error(error)
    }
  };
}

function closeModal() {
  let modal = document.getElementById("popupModal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  resetModal(modal)
}

function openModalConfirm(id) {
  let modal = document.getElementById("popup-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const confirmAction = document.getElementById("popup-setuju")
  const csrfToken = getCSRFToken()

  confirmAction.onclick = async function () {
    try {
      const response = await fetch(`/api/bonus/${id}/`, {
        method: "PATCH",
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "tanggal_cair": new Date().toISOString()
        })
      })
      const result = await response.json()
      if (response.ok) {
        const headScs = "Berhasil"
        const parScs = "Data berhasil ditambah"
        showSuccessToast(headScs, parScs)
        console.log("Bonus telah dicairkan ke Sales tanggal ", new Date().toISOString())
        console.log(result)
        location.reload()
      } else {
        console.log("Gagal mengirim tanggal cair", result)
      }
    } catch (error) {
      const head = "Gagal Melakukan Aksi"
      const par = "Terjadi kesalahan dalam menyimpan data"
      showWarningToast(head, par)
      console.error("Terjadi kesalahan: ", error)
    }
    closeModalConfirm()
  }
}

function closeModalConfirm() {
  let modal = document.getElementById("popup-modal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  resetModal(modal)
}

async function getMerk(id) {
  let modal = document.getElementById("popupModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const select = document.getElementById("merk");
  const input = document.getElementById("bonus");

  select.innerHTML = '<option value="" disabled>Masukkan merek barang</option>';
  select.disabled = false;
  input.value = ""

  try {
    if (id) {
      const respons = await fetch(`/api/persenbonus/${id}/`);
      const data = await respons.json()

      const option = document.createElement("option");
      option.value = data.merk_nama;
      option.textContent = data.merk_nama;
      option.selected = true;
      select.appendChild(option);
      select.disabled = true;

      input.value = data.persenan;

    } else {
      const response = await fetch('/api/barang/merk_choices_listmerek/');
      const choices = await response.json();

      const selectedMerk = select.dataset.selectedMerk;
      const placeholder = select.querySelector('option[value=""]');
      choices.forEach(choice => {
        let option = document.createElement("option");
        option.value = choice.value;
        option.textContent = choice.label;
        if (choice.disabled) {
          option.disabled = true;
        }
        if (choice.value === selectedMerk) {
          option.selected = true;
          if (placeholder) placeholder.removeAttribute('selected');
        }
        select.appendChild(option);
      });

      select.disabled = false;
    }
  } catch (err) {
    console.error("Gagal ambil data merk atau bonus:", err);
  }

  const bonusBtn = document.getElementById("bonusBtn");
  bonusBtn.onclick = async function () {
    const merk = select.value
    const bonus = input.value
    const csrfToken = getCSRFToken()

    if (!merk || !bonus) {
      showWarningToast("Data Tidak Lengkap", "Lengkapi merek dan bonus")
      return;
    }

    try {
      let response, data;
      if (id) {
        response = await fetch(`/api/persenbonus/${id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
          body: JSON.stringify({ "persenan": bonus })
        });
        data = await response.json();
      } else {
        response = await fetch('/api/persenbonus/', {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
          body: JSON.stringify({ "merk_nama": merk, "persenan": bonus })
        });
        data = await response.json();
      }

      if (response.ok) {
        showSuccessToast("Berhasil", "Data berhasil disimpan")
      } else {
        showWarningToast("Gagal", "Gagal menyimpan data")
      }
    } catch (err) {
      console.error("Gagal submit bonus:", err);
      showWarningToast("Gagal", "Terjadi kesalahan")
    }
  }
}

function validate() {
  const tanggal = document.querySelectorAll(".tanggal-cair")
  tanggal.forEach(tgl => {
    if (tgl.textContent.trim().toLowerCase() !== "" && tgl.textContent.trim().toLowerCase() !== "none") {
      const row = tgl.closest("tr")
      let buttonByr = row.querySelector(".bayar")
      if (buttonByr) {
        buttonByr.disabled = true
      }
    }
  })
}

function minusCheck() {
  const allInput = document.querySelectorAll("input")
  allInput.forEach(input => {
    if (input.type == "number" && input.value < 0) {
      const headWarn = "Peringatan Input Minus"
      const parWarn = "Harga, diskon dan tanggal tidak bisa minus"
      showWarningToast(headWarn, parWarn)
      input.value = null
      return
    }
  })
}

function attachMinusCheck() {
  const allInput = document.querySelectorAll("input[type='number']");
  allInput.forEach(input => {
    input.addEventListener("input", minusCheck);
  });
}