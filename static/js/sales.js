document.addEventListener("DOMContentLoaded", () => {
  attachMinusCheck()
  validate()
})

function showWarningToast(head, msg) {
  const toast = document.getElementById("toastWarning");
  const title = document.getElementById("toastWarnHead");
  const paragraph = document.getElementById("toastWarnPar");

  title.innerText = head;
  paragraph.innerText = msg;

  toast.classList.remove("hidden");

  if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

  toast.toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

function showSuccessToast(head, msg) {
  const toast = document.getElementById("toastSuccess");
  const title = document.getElementById("toastScs");
  const paragraph = document.getElementById("toastScsp");

  title.innerText = head;
  paragraph.innerText = msg;

  toast.classList.remove("hidden");

  if (toast.toastTimeout) clearTimeout(toast.toastTimeout);

  toast.toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
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
}

async function getMerk(id) {
  let modal = document.getElementById("popupModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const select = document.getElementById("merk");
  const input = document.getElementById("bonus");

  select.innerHTML = '<option value="" disabled>Masukkan merek barang</option>';
  select.disabled = false;
  input.value = "";

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
      const response = await fetch('/api/barang/merk_choices/');
      const choices = await response.json();

      const selectedMerk = select.dataset.selectedMerk;
      const placeholder = select.querySelector('option[value=""]');
      choices.forEach(choice => {
        let option = document.createElement("option");
        option.value = choice.value;
        option.textContent = choice.label;
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
}

function validate() {
  const tanggal = document.querySelectorAll(".tanggal-cair")
  tanggal.forEach(tgl => {
    if (tgl.textContent.trim() !== "") {
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