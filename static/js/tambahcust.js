document.getElementById("custForm").addEventListener("submit", async(event) =>{
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

    const customer  = new FormData()
    customer.append("user_id", salesId)
    customer.append("nama", nama)
    customer.append("no_hp", noHp)
    customer.append("toko", toko)
    customer.append("lokasi", lokasi)
    customer.append("catatan", catatan)
    customer.append("alamat_lengkap", alamat)

    const response = await fetch(apiCustomer, {
        method: method,
        body: customer
    })
    const result = await response.json()
    console.log(result);
})