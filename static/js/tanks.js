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
    const manageBtn = buttons[1];
    const deleteBtn = buttons[2];
    const addBtn = buttons[3];

    if (editBtn) editBtn.addEventListener("click", openEditModal);
    if (deleteBtn) deleteBtn.addEventListener("click", openDeleteModal);
    if (addBtn) addBtn.addEventListener("click", () => {
      addTankModal.style.display = "block";
    });
  }

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
