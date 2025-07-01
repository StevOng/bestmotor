document.addEventListener('DOMContentLoaded', function () {
    getSales()
})

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

document.getElementById("custForm").addEventListener("submit", async (event) => {
    event.preventDefault()

    const id = document.getElementById("custId")?.value || null
    const nama = document.getElementById("nama-sucustpp").value
    const noHp = document.getElementById("nohp-cust").value
    const salesId = document.getElementById("salesId").value
    const toko = document.getElementById("toko-cust").value
    const lokasi = document.getElementById("lokasi-cust").value
    const catatan = document.getElementById("catatan-cust").value
    const alamat = document.getElementById("alamat-cust").value

    const method = id ? "PATCH" : "POST" // jika ada id edit, tidak? tambah
    const apiCustomer = id ? `/api/customer/${id}/` : `/api/customer/`
    const csrfToken = getCSRFToken()

    const customer = new FormData()
    customer.append("user_id", salesId)
    customer.append("nama", nama)
    customer.append("no_hp", noHp)
    customer.append("toko", toko)
    customer.append("lokasi", lokasi)
    customer.append("catatan", catatan)
    customer.append("alamat_lengkap", alamat)

    const response = await fetch(apiCustomer, {
        method: method,
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: customer
    })
    const result = await response.json()
    if (response.ok) {
        console.log(result);
        showSuccessToast("Berhasil", "Berhasil menyimpan data")
        setTimeout(() => {
            location.replace("/customer/");
        }, 1000);
    } else {
        console.log("Gagal", result)
        showWarningToast("Gagal", "Gagal menyimpan data")
    }
})

async function getSales() {
    console.log("panggil getSales")
    try {
        const response = await fetch('/api/user/list_sales/')
        console.log(response)
        const choices = await response.json()
        console.log(`data user: ${choices}`)

        const select = document.getElementById("sales-bestmtr")
        const selectedSales = select.dataset.selectedSales
        const inputSalesId = document.getElementById("salesId")

        choices.forEach(choice => {
            const option = document.createElement("option")
            option.value = choice.value
            option.textContent = choice.label

            if (String(choice.value) === String(selectedSales)) {
                option.selected = true
                inputSalesId.value = choice.value
                const placeholder = select.querySelector('option[value=""]')
                if (placeholder) placeholder.removeAttribute('selected')
            }

            select.appendChild(option)
        })
        select.addEventListener("change", (e) => {
            inputSalesId.value = e.target.value
            console.log("User memilih sales dengan ID:", e.target.value)
        })

    } catch (err) {
        console.error("Error:", err)
        showWarningToast("Gagal", "Terjadi Kesalahan")
    }
}


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

  toast.innerHTML =`
      <div class="toast flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-100 shadow-lg">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 id="toastScs" class="text-sm font-medium text-yellow-800">${head}</h3>
          <p id="toastScsp" class="mt-1 text-sm text-yellow-600">${msg}</p>
        </div>
        <button onclick="document.getElementById('toastSuccess').classList.add('hidden')"  class="ml-auto text-yellow-400 hover:text-yellow-500">
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