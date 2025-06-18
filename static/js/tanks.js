document.addEventListener("DOMContentLoaded", () => {
  const addTankModal = document.getElementById("addTankModal");
  const addTankForm = document.getElementById("addTankForm");
  const sliderContainer = document.querySelector(".tank-slider-container");
  const dotsContainer = document.getElementById("dots");

  const deleteModal = document.getElementById("deleteTankModal");
  const deleteForm = document.getElementById("deleteTankForm");
  const tankSelect = document.getElementById("tankSelect");

  const editModal = document.getElementById("editTankModal");
  const editForm = document.getElementById("editTankForm");
  const editSelect = document.getElementById("editTankSelect");

  const editTankName = document.getElementById("editTankName");
  const editVolume = document.getElementById("editVolume");
  const editTemperature = document.getElementById("editTemperature");
  const editPh = document.getElementById("editPh");
  const editKh = document.getElementById("editKh");
  const editGh = document.getElementById("editGh");
  const editDescription = document.getElementById("editDescription");
  const editImage = document.getElementById("editImage");

  const manageStockModal = document.getElementById("manageStockModal");
  const modalTankId = document.getElementById("modalTankId");

  let currentSlide = 0;
  let currentEditIndex = null;

  function getSlides() {
    return Array.from(document.querySelectorAll(".slide"));
  }

  function showSlide(index) {
    const slides = getSlides();
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    currentSlide = index;
    updateDots();
  }

  function updateDots() {
    dotsContainer.innerHTML = "";
    const slides = getSlides();
    slides.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      if (index === currentSlide) dot.classList.add("active");
      dot.addEventListener("click", () => showSlide(index));
      dotsContainer.appendChild(dot);
    });
  }

  function addEventListenersToCard(card) {
    const buttons = card.querySelectorAll(".tank-actions button");
    const editBtn = buttons[0];
    const manageBtn = buttons[1];
    const deleteBtn = buttons[2];
    const addBtn = buttons[3];

    if (editBtn) editBtn.addEventListener("click", openEditModal);
    if (deleteBtn) deleteBtn.addEventListener("click", openDeleteModal);
    if (addBtn)
      addBtn.addEventListener("click", () => {
        addTankModal.style.display = "block";
      });

    if (manageBtn) {
      manageBtn.addEventListener("click", () => {
        const tankId = card.closest(".slide").dataset.tankId;
        document.getElementById("modalTankId").value = tankId;
        openManageStockModal();
      });
    }
  }

  function openDeleteModal() {
    tankSelect.innerHTML = "";
    getSlides().forEach((slide, index) => {
      const name =
        slide.querySelector(".tank-name-title").textContent ||
        `Tank ${index + 1}`;
      const option = document.createElement("option");
      option.value = index;
      option.textContent = name;
      tankSelect.appendChild(option);
    });
    deleteModal.style.display = "block";
  }

  function closeDeleteModal() {
    deleteModal.style.display = "none";
  }

  async function openManageStockModal() {
    const modal = document.getElementById("manageStockModal");
    modal.style.display = "block";

    const tankId = document.getElementById("modalTankId").value;

    // 1. Pobierz i wyświetl listę dostępnych gatunków ryb
    const select = document.getElementById("newFishSelect");
    select.innerHTML = "";
    try {
      const res = await fetch("/tanks/fish_species");
      const speciesList = await res.json();
      speciesList.forEach((species) => {
        const option = document.createElement("option");
        option.value = species.id;
        option.textContent = species.name;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Error loading fish species:", err);
    }

    // 2. Pobierz i wyświetl aktualny stock ryb w zbiorniku
    const existingList = document.getElementById("existingFishList");
    existingList.innerHTML = "<h4>Current Stock</h4>";

    try {
      const res = await fetch(`/tanks/tank_stock/${tankId}`);

      const stock = await res.json();

      if (stock.length === 0) {
        existingList.innerHTML += "<p>No fish added yet.</p>";
      } else {
        const ul = document.createElement("ul");
        stock.forEach((item) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${item.name}</strong> (x${item.count})
            <button data-stock-id="${item.id}" class="delete-fish-btn">🗑</button>
          `;
          ul.appendChild(li);
        });
        existingList.appendChild(ul);

        // Dodaj listener do przycisków usuwania
        existingList.querySelectorAll(".delete-fish-btn").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const stockId = btn.dataset.stockId;
            await fetch(`/tanks/delete_fish/${stockId}`, { method: "POST" });
            openManageStockModal(); // przeładuj stock
          });
        });
      }
    } catch (err) {
      console.error("Error loading tank stock:", err);
    }
  }

  document
  .getElementById("manageStockForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const tankId = document.getElementById("modalTankId").value;
    const fishId = document.getElementById("newFishSelect").value;
    const count = document.getElementById("newFishCount").value;

    try {
      const res = await fetch("/tanks/add_fish_to_tank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tank_id: tankId,
          fish_id: fishId,
          count: count,
        }),
      });

      const data = await res.json();

      if (res.status === 400 && data.error === "Overstocking") {
        alert("❗ Tank overstocked!\n" + data.message);
        return;
      }

      if (res.status === 200) {
        if (data.mismatches && data.mismatches.length > 0) {
          alert(
            "⚠️ Warning: Tank parameters may not be ideal for this fish:\n" +
              data.mismatches.join(", ")
          );
        }
        await openManageStockModal(); // odśwież stock
      } else {
        alert("Error adding fish");
      }
    } catch (err) {
      console.error("Error sending fish:", err);
      alert("Error adding fish");
    }
  });


  function closeManageStockModal() {
    document.getElementById("manageStockModal").style.display = "none";
  }

  function openEditModal() {
    editSelect.innerHTML = "";
    getSlides().forEach((slide, index) => {
      const name =
        slide.querySelector(".tank-name-title").textContent ||
        `Tank ${index + 1}`;
      const option = document.createElement("option");
      option.value = index;
      option.textContent = name;
      editSelect.appendChild(option);
    });
    populateEditForm(0);
    editModal.style.display = "block";
  }

  editSelect.addEventListener("change", () => {
    const index = parseInt(editSelect.value);
    populateEditForm(index);
  });

  function populateEditForm(index) {
    const slide = getSlides()[index];
    if (!slide) return;

    currentEditIndex = index;

    editTankName.value = slide.querySelector(".tank-name-title").textContent;
    const params = slide.querySelectorAll(".tank-params p");
    editVolume.value = params[0].textContent.split(":")[1].trim();
    editPh.value = params[1].textContent.split(":")[1].trim();
    editKh.value = params[2].textContent.split(":")[1].trim();
    editTemperature.value = params[3].textContent.split(":")[1].trim();
    editGh.value = params[4].textContent.split(":")[1].trim();
    editDescription.value = slide
      .querySelector(".tank-description")
      .textContent.replace("Description:", "")
      .trim();

    document.getElementById("editTankId").value = slide.dataset.tankId;
  }

  // ❌ USUWAMY ręczne zapisywanie do DOM — formularz leci do Flask!
  // editForm.addEventListener("submit", function (e) { e.preventDefault(); ... });

  function closeEditModal() {
    editModal.style.display = "none";
    editForm.reset();
  }

  window.addEventListener("click", function (e) {
    if (e.target === addTankModal) closeTankModal();
    if (e.target === deleteModal) closeDeleteModal();
    if (e.target === editModal) closeEditModal();
    if (e.target == manageStockModal) closeManageStockModal();
  });

  function closeTankModal() {
    addTankModal.style.display = "none";
    addTankForm.reset();
  }

  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("collapsed");
  });

  getSlides().forEach(addEventListenersToCard);
  showSlide(0);

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn?.addEventListener("click", () => {
    const slides = getSlides();
    const newIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(newIndex);
  });

  nextBtn?.addEventListener("click", () => {
    const slides = getSlides();
    const newIndex = (currentSlide + 1) % slides.length;
    showSlide(newIndex);
  });

  document
    .getElementById("newFishSelect")
    .addEventListener("change", async function () {
      const speciesId = this.value;
      if (!speciesId) return;

      try {
        const response = await fetch(`/tanks/fish_info/${speciesId}`);
        const data = await response.json();

        const container = document.getElementById("fishCompatibility");
        container.innerHTML = `
        <div style="display:flex; align-items:center; gap:15px;">
          <img src="/static/img/fishspecies/${data.image}" alt="${data.name}" style="width: 100px; border-radius: 10px;" />
          <div>
            <strong>${data.name}</strong><br>
            Temp: ${data.min_temperature}–${data.max_temperature}°C<br>
            pH: ${data.min_ph}–${data.max_ph}<br>
            KH: ${data.min_kh}–${data.max_kh}<br>
            GH: ${data.min_gh}–${data.max_gh}
          </div>
        </div>
      `;
      } catch (err) {
        console.error("Error loading fish data:", err);
      }
    });
});
