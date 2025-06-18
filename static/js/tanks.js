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

    // 🧠 Obsługa Settings Modal
  const settingsForm = document.getElementById('dailyChecksForm');
  const tankIdInput = document.getElementById('settingsTankId');
  const checkboxes = settingsForm?.querySelectorAll('input[name="checks"]');

  function openSettingsModal(tankId) {
    document.getElementById('settingsModal').style.display = 'block';

    // Ustaw tank_id w ukrytym polu formularza
    tankIdInput.value = tankId;

    // Pobierz zapisane dane z atrybutu data-checks
    const slide = [...getSlides()].find(slide => slide.dataset.tankId === tankId);
    const checks = slide?.dataset.checks ? JSON.parse(slide.dataset.checks) : [];

    // Odznacz wszystkie
    checkboxes.forEach(cb => cb.checked = false);

    // Zaznacz wybrane
    checks.forEach(val => {
      const checkbox = settingsForm.querySelector(`input[value="${val}"]`);
      if (checkbox) checkbox.checked = true;
    });

    openSettingsTab('dailyTab');  // domyślna zakładka
  }
  // 📌 Dodajemy eventy do przycisków "Settings"
  document.querySelectorAll('.settings-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slide = btn.closest('.slide');
      const tankId = slide.dataset.tankId;
      importantTankId.value = tankId;

      resetImportantTasks();  // czyści wszystko

      const tasksDataAttr = slide.dataset.importantTasks;
      if (tasksDataAttr) {
        try {
          const savedTasks = JSON.parse(tasksDataAttr);  // np. [{task_type: 'waterchange', start_date: '2024-01-01', interval_days: 7}, ...]
          savedTasks.forEach(task => {
            const checkbox = importantForm.querySelector(`input.task-toggle[value="${task.task_type}"]`);
            const optionsWrapper = checkbox?.closest('.important-task-item');
            if (checkbox && optionsWrapper) {
              checkbox.checked = true;
              optionsWrapper.querySelector('.task-options')?.classList.remove('d-none');

              // Ustaw datę i interwał
              optionsWrapper.querySelector(`input[name="${task.task_type}_start"]`).value = task.start_date;
              optionsWrapper.querySelector(`input[name="${task.task_type}_interval"]`).value = task.interval_days;
            }
          });
        } catch (err) {
          console.error("Could not parse important tasks:", err);
        }
      }
    });
  });



    // === Important Tasks – pokaż opcje przy zaznaczeniu ===
  const importantForm = document.getElementById('importantTasksForm');

  if (importantForm) {
    const taskCheckboxes = importantForm.querySelectorAll('.task-toggle');

    taskCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const wrapper = checkbox.closest('.important-task-item');
        const options = wrapper.querySelector('.task-options');
        if (options) {
          options.classList.toggle('d-none', !checkbox.checked);
        }
      });
    });

    const importantTankId = document.getElementById('importantTasksTankId');
    function resetImportantTasks() {
      // Ukryj wszystkie pola opcji i odznacz checkboxy
      const allTaskItems = importantForm.querySelectorAll('.important-task-item');
      allTaskItems.forEach(item => {
        const checkbox = item.querySelector('.task-toggle');
        const options = item.querySelector('.task-options');
        if (checkbox) checkbox.checked = false;
        if (options) options.classList.add('d-none');
      });
    }

    document.querySelectorAll('.settings-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slide = btn.closest('.slide');
        const tankId = slide.dataset.tankId;
        importantTankId.value = tankId;
        resetImportantTasks();  // domyślnie czyści wszystkie checkboxy i pola
      });
    });
  }

  // === Przełączanie zakładek w Settings Modal ===
  const tabButtons = document.querySelectorAll('#settingsTabNav .nav-link');
  const checksTab = document.getElementById('checksTab');
  const tasksTab = document.getElementById('tasksTab');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Dezaktywuj wszystkie
      tabButtons.forEach(btn => btn.classList.remove('active'));

      // Ukryj wszystkie taby
      if (checksTab) checksTab.style.display = 'none';
      if (tasksTab) tasksTab.style.display = 'none';

      // Aktywuj kliknięty
      button.classList.add('active');

      // Pokaż odpowiedni tab
      const targetId = button.getAttribute('data-bs-target');
      const targetTab = document.querySelector(targetId);
      if (targetTab) {
        targetTab.style.display = 'block';
      }
    });
  });


});
