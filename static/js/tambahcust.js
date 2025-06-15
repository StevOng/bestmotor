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
    if (response.ok) {
        const result = await response.json()
        console.log(result);
        setTimeout(() => {
            location.replace("/customer/");
        }, 1000);
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
    }
}
