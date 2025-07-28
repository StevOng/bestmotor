document
  .getElementById("scrollLeft1")
  .addEventListener("click", function () {
    document
      .getElementById("scrollContainer1")
      .scrollBy({ left: -200, behavior: "smooth" });
  });

document
  .getElementById("scrollRight1")
  .addEventListener("click", function () {
    document
      .getElementById("scrollContainer1")
      .scrollBy({ left: 200, behavior: "smooth" });
  });

document
  .getElementById("scrollLeft2")
  .addEventListener("click", function () {
    document
      .getElementById("scrollContainer2")
      .scrollBy({ left: -200, behavior: "smooth" });
  });

document
  .getElementById("scrollRight2")
  .addEventListener("click", function () {
    document
      .getElementById("scrollContainer2")
      .scrollBy({ left: 200, behavior: "smooth" });
  });

document
  .getElementById("scrollLeft3")
  .addEventListener("click", function () {
    document
      .getElementById("scrollContainer3")
      .scrollBy({ left: -200, behavior: "smooth" });
  });

document
  .getElementById("scrollRight3")
  .addEventListener("click", function () {
    document
      .getElementById("scrollContainer3")
      .scrollBy({ left: 200, behavior: "smooth" });
  });

const searchInput = document.getElementById("productSearch");
const searchBtn = document.querySelector("button[type=button] i.fa-search").closest("button");
const banner = document.querySelector(".catalog-banner")
const png = document.querySelector(".sparepart-png")

searchInput.addEventListener("input", filterCatalog);
searchBtn.addEventListener("click", filterCatalog);

function filterCatalog() {
  const term = searchInput.value.trim().toLowerCase();
  if (term) {
    banner.style.display = "none"
    png.style.display = "none"
  } else {
    banner.style.display = ""
    png.style.display = ""
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
