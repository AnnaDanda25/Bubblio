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
    const manageBtn = buttons[1]; // do wdrożenia
    const deleteBtn = buttons[2];
    const addBtn = buttons[3];

    if (editBtn) editBtn.addEventListener("click", openEditModal);
    if (deleteBtn) deleteBtn.addEventListener("click", openDeleteModal);
    if (addBtn) addBtn.addEventListener("click", () => {
      addTankModal.style.display = "block";
    });
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

      const slide = document.createElement("div");
      slide.classList.add("slide");

      const card = document.createElement("div");
      card.classList.add("tank-card");
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
              <p class="tank-description"><strong>Description:</strong> ${description}</p>
            </div>
          </div>
          <div class="tank-stocking">
            <h4>Tank Stocking</h4>
            <div class="fish-list">
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

      slide.appendChild(card);
      sliderContainer.appendChild(slide);
      addEventListenersToCard(card);
      showSlide(getSlides().length - 1);
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
      const name = slide.querySelector(".tank-name-title").textContent || `Tank ${index + 1}`;
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

  function openEditModal() {
    editSelect.innerHTML = "";
    getSlides().forEach((slide, index) => {
      const name = slide.querySelector(".tank-name-title").textContent || `Tank ${index + 1}`;
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
    editDescription.value = slide.querySelector(".tank-description").textContent.replace("Description:", "").trim();
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
    slide.querySelector(".tank-description").innerHTML = `<strong>Description:</strong> ${editDescription.value}`;

    closeEditModal();
  });

  function closeEditModal() {
    editModal.style.display = "none";
    editForm.reset();
  }

  window.addEventListener("click", function (e) {
    if (e.target === addTankModal) closeTankModal();
    if (e.target === deleteModal) closeDeleteModal();
    if (e.target === editModal) closeEditModal();
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

});
