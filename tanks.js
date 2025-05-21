document.addEventListener("DOMContentLoaded", () => {
  const addTankModal = document.getElementById("addTankModal");
  const addTankForm = document.getElementById("addTankForm");
  const sliderContainer = document.querySelector(".tank-slider-container");
  const dotsContainer = document.getElementById("dots");
  const globalAddBtn = document.querySelector(".add-tank-btn");
  const deleteModal = document.getElementById("deleteTankModal");
  const deleteForm = document.getElementById("deleteTankForm");
  const tankSelect = document.getElementById("tankSelect");

  let currentSlide = 0;

  function getSlides() {
    return Array.from(document.querySelectorAll(".tank-card"));
  }

  function showSlide(index) {
    const slides = getSlides();
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    currentSlide = index;
    updateDots();
  }

  function nextSlide() {
    const slides = getSlides();
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    const slides = getSlides();
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
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

  function checkIfNoTanks() {
    const slides = getSlides();
    const emptyState = document.getElementById("emptyState");
    const sliderWrapper = document.querySelector(".slider-wrapper");

    if (slides.length === 0) {
      sliderWrapper.style.display = "none";
      emptyState.style.display = "block";
    } else {
      sliderWrapper.style.display = "block";
      emptyState.style.display = "none";
    }
  }

  function addEventListenersToCard(card) {
    const buttons = card.querySelectorAll(".tank-actions button");
    const editBtn = buttons[0];
    const manageBtn = buttons[1];
    const deleteBtn = buttons[2];
    const addBtn = buttons[3];

    if (editBtn) {
      editBtn.addEventListener("click", openEditModal);
    }

    if (manageBtn) {
      manageBtn.addEventListener("click", () => {
        const slideIndex = getSlides().indexOf(card);
        openManageStockModal(slideIndex);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", openDeleteModal);
    }

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        addTankModal.style.display = "block";
      });
    }
  }

  addTankForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const tankName = document.getElementById("tankName").value;
    const volume = document.getElementById("volume").value;
    const temperature = document.getElementById("temperature").value;
    const ph = document.getElementById("ph").value;
    const kh = document.getElementById("kh").value;
    const gh = document.getElementById("gh").value;
    const description = document.getElementById("description").value;
    const imageFile = document.getElementById("tankImage").files[0];

    const reader = new FileReader();
    reader.onload = function () {
      const imageUrl = reader.result;

      const card = document.createElement("div");
      card.classList.add("tank-card", "slide");
      card.innerHTML = `
        <h2 class="tank-name-title text-center">${tankName}</h2>
        <div class="tank-details">
  <div class="tank-left">
    <img src="${imageUrl}" alt="${tankName}" class="tank-image" />
    <div class="tank-params">
      <p><strong>Volume (L):</strong> ${volume}</p>
      <p><strong>pH:</strong> ${ph}</p>
      <p><strong>KH:</strong> ${kh}</p>
      <p><strong>Temp (°C):</strong> ${temperature}</p>
      <p><strong>GH:</strong> ${gh}</p>
    </div>
  </div>

  <p class="tank-description"><strong>Description:</strong> ${description}</p>

  <div class="tank-stocking">
    <h4>Tank stocking</h4>
    <div class="fish-list compact">
      <div class="fish-item">No fish yet</div>
    </div>
  </div>
</div>

        <div class="tank-actions">
          <button>Edit Tank</button>
          <button>Manage Stock</button>
          <button class="delete-btn">Delete Tank</button>
          <button class="add-tank-btn">Add New Tank</button>
        </div>
      `;
      sliderContainer.appendChild(card);
      addEventListenersToCard(card);
      showSlide(getSlides().length - 1);
      checkIfNoTanks();
      addTankForm.reset();
      addTankModal.style.display = "none";
    };

    if (imageFile) {
      reader.readAsDataURL(imageFile);
    } else {
      reader.onload({ target: { result: "img/example_tank.jpg" } });
    }
  });

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

  deleteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const index = parseInt(tankSelect.value);
    const slides = getSlides();
    if (!isNaN(index) && slides[index]) {
      slides[index].remove();
      showSlide(Math.max(0, currentSlide - 1));
    }
    checkIfNoTanks();
    closeDeleteModal();
  });

  // Obsługa strzałek slidera
  document
    .querySelector(".slider-arrow.left")
    ?.addEventListener("click", prevSlide);
  document
    .querySelector(".slider-arrow.right")
    ?.addEventListener("click", nextSlide);

  getSlides().forEach(addEventListenersToCard);
  showSlide(0);
  checkIfNoTanks();

  // === ZAMYKANIE MODALI ===
  window.closeTankModal = function () {
    const modal = document.getElementById("addTankModal");
    if (modal) {
      modal.style.display = "none";
      document.getElementById("addTankForm").reset();
    }
  };

  window.closeDeleteModal = function () {
    const modal = document.getElementById("deleteTankModal");
    if (modal) {
      modal.style.display = "none";
    }
  };

  window.closeEditModal = function () {
    const modal = document.getElementById("editTankModal");
    if (modal) {
      modal.style.display = "none";
      document.getElementById("editTankForm").reset();
    }
  };

  window.addEventListener("click", function (e) {
    if (e.target === addTankModal) closeTankModal();
    if (e.target === deleteModal) closeDeleteModal();
    if (e.target === editModal) closeEditModal();
  });

  ///////EDIT TANK
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

  let currentEditIndex = null;

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

    populateEditForm(0); // załaduj pierwszy tank domyślnie
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
  }

  function closeEditModal() {
    editModal.style.display = "none";
    editForm.reset();
  }

  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const slides = getSlides();
    const slide = slides[currentEditIndex];

    slide.querySelector(".tank-name-title").textContent = editTankName.value;
    const params = slide.querySelectorAll(".tank-params p");
    params[0].innerHTML = `<strong>Volume (L):</strong> ${editVolume.value}`;
    params[1].innerHTML = `<strong>pH:</strong> ${editPh.value}`;
    params[2].innerHTML = `<strong>KH:</strong> ${editKh.value}`;
    params[3].innerHTML = `<strong>Temp (°C):</strong> ${editTemperature.value}`;
    params[4].innerHTML = `<strong>GH:</strong> ${editGh.value}`;
    slide.querySelector(
      ".tank-description"
    ).innerHTML = `<strong>Description:</strong> ${editDescription.value}`;

    const file = editImage.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        slide.querySelector(".tank-image").src = reader.result;
        closeEditModal();
      };
      reader.readAsDataURL(file);
    } else {
      closeEditModal();
    }
  });

  // === MANAGE STOCK ===
  const manageStockModal = document.getElementById("manageStockModal");
  const manageStockForm = document.getElementById("manageStockForm");
  const stockTankSelect = document.getElementById("stockTankSelect");
  const fishListContainer = document.getElementById("existingFishList");
  const fishDropdown = document.getElementById("newFishSelect");
  const fishCountInput = document.getElementById("newFishCount");

  let currentStockIndex = 0;

  const fishDatabase = [
    {
      name: "Neon Tetra",
      image: "img/neon.jpg",
      tempRange: [20, 26],
      phRange: [6.0, 7.5],
      ghRange: [3, 10],
      khRange: [1, 5],
    },
    {
      name: "Guppy",
      image: "img/guppy.jpg",
      tempRange: [22, 28],
      phRange: [6.8, 7.8],
      ghRange: [8, 12],
      khRange: [6, 15],
    },
    {
      name: "Red Cherry Shrimp",
      image: "img/redcherryshrimp.jpg",
      tempRange: [20, 27],
      phRange: [6.5, 7.5],
      ghRange: [4, 8],
      khRange: [3, 6],
    },
  ];

  window.openManageStockModal = function (index = 0) {
    currentStockIndex = index;
    const slides = getSlides();
    const currentSlide = slides[index];
    const params = currentSlide.querySelectorAll(".tank-params p");
    const tankParams = {
      temp: parseFloat(params[3].textContent.split(":")[1]),
      ph: parseFloat(params[1].textContent.split(":")[1]),
      gh: parseFloat(params[4].textContent.split(":")[1]),
      kh: parseFloat(params[2].textContent.split(":")[1]),
    };

    stockTankSelect.innerHTML = "";
    slides.forEach((slide, i) => {
      const name =
        slide.querySelector(".tank-name-title")?.textContent || `Tank ${i + 1}`;
      const option = document.createElement("option");
      option.value = i;
      option.textContent = name;
      if (i === index) option.selected = true;
      stockTankSelect.appendChild(option);
    });

    updateFishDropdown(tankParams);
    updateFishList(index);
    manageStockModal.style.display = "block";
  };

  window.closeManageStockModal = function () {
    manageStockModal.style.display = "none";
    manageStockForm.reset();
    document.getElementById("fishCompatibility").innerHTML = "";
  };

  window.addEventListener("click", (e) => {
    if (e.target === manageStockModal) closeManageStockModal();
  });

  stockTankSelect.addEventListener("change", () => {
    currentStockIndex = parseInt(stockTankSelect.value);
    const slide = getSlides()[currentStockIndex];
    const params = slide.querySelectorAll(".tank-params p");
    const tankParams = {
      temp: parseFloat(params[3].textContent.split(":")[1]),
      ph: parseFloat(params[1].textContent.split(":")[1]),
      gh: parseFloat(params[4].textContent.split(":")[1]),
      kh: parseFloat(params[2].textContent.split(":")[1]),
    };
    updateFishDropdown(tankParams);
    updateFishList(currentStockIndex);
  });

  function updateFishDropdown(tankParams) {
    fishDropdown.innerHTML = "";
    [...fishDatabase]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((fish) => {
        const opt = document.createElement("option");
        opt.value = fish.name;
        opt.textContent = fish.name;
        opt.dataset.image = fish.image;
        opt.dataset.temp = JSON.stringify(fish.tempRange);
        opt.dataset.ph = JSON.stringify(fish.phRange);
        opt.dataset.gh = JSON.stringify(fish.ghRange);
        opt.dataset.kh = JSON.stringify(fish.khRange);
        fishDropdown.appendChild(opt);
      });
    updateFishDetails();
  }

  fishDropdown.addEventListener("change", updateFishDetails);

  function updateFishDetails() {
    const selected = fishDropdown.selectedOptions[0];
    if (!selected) return;
    const { image, temp, ph, gh, kh } = selected.dataset;
    const tank =
      getSlides()[currentStockIndex].querySelectorAll(".tank-params p");
    const tankParams = {
      temp: parseFloat(tank[3].textContent.split(":")[1]),
      ph: parseFloat(tank[1].textContent.split(":")[1]),
      gh: parseFloat(tank[4].textContent.split(":")[1]),
      kh: parseFloat(tank[2].textContent.split(":")[1]),
    };
    const compatible =
      tankParams.temp >= JSON.parse(temp)[0] &&
      tankParams.temp <= JSON.parse(temp)[1] &&
      tankParams.ph >= JSON.parse(ph)[0] &&
      tankParams.ph <= JSON.parse(ph)[1] &&
      tankParams.gh >= JSON.parse(gh)[0] &&
      tankParams.gh <= JSON.parse(gh)[1] &&
      tankParams.kh >= JSON.parse(kh)[0] &&
      tankParams.kh <= JSON.parse(kh)[1];
    document.getElementById("fishCompatibility").innerHTML = `
  <div style="display: flex; gap: 24px; align-items: flex-start; margin-top: 20px;">
    <img src="${image}" style="width: 200px; height: 150px; border-radius: 12px; object-fit: cover;" />
    <div style="line-height: 1.6;">
      <p><strong>Temp:</strong> ${JSON.parse(temp).join("–")}°C</p>
      <p><strong>pH:</strong> ${JSON.parse(ph).join("–")}</p>
      <p><strong>GH:</strong> ${JSON.parse(gh).join("–")}</p>
      <p><strong>KH:</strong> ${JSON.parse(kh).join("–")}</p>
    </div>
  </div>
  <p style="text-align:center; font-weight:bold; margin-top: 12px; font-size: 16px; color: ${
    compatible ? "green" : "red"
  };">
    ${compatible ? "✅ Compatible" : "❌ Not compatible"}
  </p>
`;
  }

  function updateFishList(index) {
    const slide = getSlides()[index];
    const list = slide.querySelector(".fish-list");
    const fishItems = list ? [...list.querySelectorAll(".fish-item")] : [];
    fishListContainer.innerHTML = "<h4>Current Stock</h4>";

    if (
      fishItems.length === 0 ||
      (fishItems.length === 1 && fishItems[0].textContent.includes("No fish"))
    ) {
      fishListContainer.innerHTML += "<p>No fish yet.</p>";
      return;
    }

    fishItems
      .sort((a, b) => a.textContent.localeCompare(b.textContent))
      .forEach((item) => {
        const clone = item.cloneNode(true);
        const name = clone.textContent.split("[")[0].trim();

        const minus = document.createElement("button");
        minus.textContent = "–";
        minus.className = "stock-btn remove";
        minus.onclick = () => modifyFishCount(index, name, -1);

        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.className = "stock-btn add";
        plus.onclick = () => modifyFishCount(index, name, 1);

        clone.append(" ", minus, plus);
        fishListContainer.appendChild(clone);
      });
  }

  function modifyFishCount(index, name, delta) {
    const slide = getSlides()[index];
    const items = slide.querySelectorAll(".fish-item");
    for (let item of items) {
      if (item.textContent.includes(name)) {
        let count =
          parseInt(item.textContent.match(/\[(\d+)\]/)?.[1] || "0") + delta;
        if (count <= 0) {
          item.remove();
        } else {
          const img = item.querySelector("img").src;
          item.innerHTML = `<img src="${img}" alt="${name}" /> ${name} [${count}]`;
        }
        break;
      }
    }

    if (slide.querySelectorAll(".fish-item").length === 0) {
      const noFish = document.createElement("div");
      noFish.className = "fish-item";
      noFish.textContent = "No fish yet";
      slide.querySelector(".fish-list").appendChild(noFish);
    }

    updateFishList(index);
  }

  manageStockForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = fishDropdown.value;
    const count = parseInt(fishCountInput.value);
    if (!name || count <= 0) return;

    const fish = fishDatabase.find((f) => f.name === name);
    const imgSrc = fish?.image || "img/default_fish.jpg";

    const slide = getSlides()[currentStockIndex];
    const fishList = slide.querySelector(".fish-list");
    const existing = [...fishList.querySelectorAll(".fish-item")];
    const match = existing.find((i) => i.textContent.includes(name));

    if (match) {
      const currentCount = parseInt(
        match.textContent.match(/\[(\d+)\]/)?.[1] || "0"
      );
      match.innerHTML = `<img src="${imgSrc}" alt="${name}" /> ${name} [${
        currentCount + count
      }]`;
    } else {
      const div = document.createElement("div");
      div.classList.add("fish-item");
      div.innerHTML = `<img src="${imgSrc}" alt="${name}" /> ${name} [${count}]`;
      if (
        fishList.querySelector(".fish-item")?.textContent.includes("No fish")
      ) {
        fishList.innerHTML = "";
      }
      fishList.appendChild(div);
    }

    updateFishList(currentStockIndex);
    manageStockForm.reset();
  });
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("collapsed");
  });
});
