function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

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
    const csrfToken = getCSRFToken()

    const supplier = new FormData()
    supplier.append("perusahaan", perusahaan)
    supplier.append("nama_sales", namaSales)
    supplier.append("no_hp", noHp)
    supplier.append("lokasi", lokasi)
    supplier.append("jenis_barang", jenis)
    supplier.append("merk_barang", merk)
    supplier.append("catatan", catatan)
    supplier.append("alamat_lengkap", alamat)

    try{
        const response = await fetch(apiSupplier, {
        method: method,
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: supplier
        });

        const result = await response.json()
        console.log(result);

        if(response.ok){
            showSuccessToast("Berhasil", "Berhasil menyimpan data")
            setTimeout(() => {
                window.location.replace("/supplier/");
            }, 1000);
        }
    } catch (error){
        console.error("Error:", error);
        showWarningToast("Gagal", "Gagal menyimpan data")
    }
})

function minusCheck() {
    const allInput = document.querySelectorAll("input")
    allInput.forEach(input => {
        if (input.type == "number" && input.value < 0) {
            const headWarn = "Peringatan Input Minus"
            const parWarn = "Harga, diskon dan tanggal tidak bisa minus"
            showWarningToast(headWarn, parWarn)
            input.value = null
            updateDetailBiaya()
            return
        }
    })
}

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

function callListener() {
    minusCheck()
}