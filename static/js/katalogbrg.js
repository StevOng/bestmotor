const allItems = window.allItems
let currentPage = 1;
let itemsPerPage = getItemsPerPage();
let totalPages = Math.ceil(allItems.length / itemsPerPage);

function getItemsPerPage() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
        return 18;
    } else if (window.matchMedia("(min-width: 768px)").matches) {
        return 12;
    } else {
        return 6;
    }
}

const searchInput = document.getElementById("productSearch");
const searchBtn = document.querySelector("button[type=button] i.fa-search").closest("button");
const banner = document.querySelector(".catalog-banner")

searchInput.addEventListener("input", filterCatalog);
searchBtn.addEventListener("click", filterCatalog);

function filterCatalog() {
  const term = searchInput.value.trim().toLowerCase();
  if (term) {
    banner.style.display = "none"
  } else {
    banner.style.display = ""
  }

  document.querySelectorAll(".catalog-item").forEach(card => {
    const name = card.querySelector(".catalog-name").textContent.toLowerCase();
    const merk = card.querySelector(".catalog-merk").textContent.toLowerCase();

    // show if either field contains the term
    if (!term || name.includes(term) || merk.includes(term)) {
      card.style.display = "";    // un-hide
      document.querySelectorAll(".catalog-tipe-title").forEach(title => {
        title.style.display = ""
      })
    } else {
      card.style.display = "none"; // hide
      document.querySelectorAll(".catalog-tipe-title").forEach(title => {
        title.style.display = "none"
      })
    }
  });
}

function updatePagination(page) {
    const pageNumbers = document.getElementById("pageNumbers");
    pageNumbers.innerHTML = "";
    
    const createButton = (text, pageNumber, isActive = false, isDisabled = false) => {
        const button = document.createElement("button");
        button.textContent = text;
        button.className = `page-btn bg-white mx-1 p-2 px-3 rounded-full shadow ${
            isActive ? 'text-customBlue font-bold' : 'text-gray-400'
        }`;
        if (isDisabled){
            button.disabled = true;
        } else if(!isNaN(pageNumber)) {
            button.dataset.page = pageNumber;
            button.addEventListener("click", () => {
                currentPage = pageNumber;
                renderItems(currentPage);
            });
        }
        return button;
    };

    if (totalPages <= 5) {
        // Jika halaman kurang dari atau sama dengan 5, tampilkan semua angka
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.appendChild(createButton(i, i, i === page));
        }
    } else {
        // Selalu tampilkan halaman pertama
        pageNumbers.appendChild(createButton(1, 1, page === 1));

        if (page > 3) {
            pageNumbers.appendChild(createButton("...", null, false, true));
        }

        let start = Math.max(2, page - 1);
        let end = Math.min(totalPages - 1, page);

        for (let i = start; i <= end; i++) {
            pageNumbers.appendChild(createButton(i, i, i === page));
        }

        if (page < totalPages - 2) {
            pageNumbers.appendChild(createButton("...", null, false, true));
        }

        // Selalu tampilkan halaman terakhir
        pageNumbers.appendChild(createButton(totalPages, totalPages, page === totalPages));
    }

    // Disable tombol prev/next jika di halaman pertama atau terakhir
    document.getElementById("prevPage").disabled = page === 1;
    document.getElementById("nextPage").disabled = page === totalPages;
}

// Panggil updatePagination setelah renderItems
function renderItems(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    document.getElementById("productContainer").innerHTML = allItems.slice(start, end).join("");
    updatePagination(page);
}

document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderItems(currentPage);
    }
});

document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        renderItems(currentPage);
    }
});

window.addEventListener("resize", () => {
    itemsPerPage = getItemsPerPage()
    totalPages = Math.ceil(allItems.length / itemsPerPage)
    renderItems(currentPage);
});

renderItems(currentPage);