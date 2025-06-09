document.getElementById("supplierForm").addEventListener("submit", async(event) => {
    event.preventDefault()

    const id = document.getElementById("supId")?.value || null
    const perusahaan = document.getElementById("nama-supp").value
    const namaSales = document.getElementById("nama-sales").value
    const noHp = document.getElementById("nohp-supp").value
    const lokasi = document.getElementById("lokasi-supp").value
    const jenis = document.getElementById("jenis-brg").value
    const merk = document.getElementById("merk-supp").value
    const catatan = document.getElementById("catatan-supp").value
    const alamat = document.getElementById("alamat-supp").value

    const method = id ? "PATCH" : "POST"
    const apiSupplier = id ? `/api/supplier/${id}/` : `/api/supplier/`

    const supplier = new FormData()
    supplier.append("perusahaan", perusahaan)
    supplier.append("nama_sales", namaSales)
    supplier.append("no_hp", noHp)
    supplier.append("lokasi", lokasi)
    supplier.append("jenis_barang", jenis)
    supplier.append("merk_barang", merk)
    supplier.append("catatan", catatan)
    supplier.append("alamat_lengkap", alamat)

    const response = await fetch(apiSupplier, {
        method: method,
        body: supplier
    })
    const result = await response.json()
    console.log(result);
})