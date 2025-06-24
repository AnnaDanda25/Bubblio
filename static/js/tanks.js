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

      const data = await res.json();
      const stock = data.stock;

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

        // przyciski do usuwania
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
    await updateTankStockDisplay(tankId);
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

        if (res.ok) {
          // ✔️ Nie pokazujemy alertów – info pod rybą
          await openManageStockModal();
          await updateTankStockDisplay(tankId);
        } else {
          console.warn("Fish added with warnings:", data);
          await updateTankStockDisplay(tankId);
        }
      } catch (err) {
        console.error("Error sending fish:", err);
        alert("Error adding fish");
      }
    });

  function closeManageStockModal() {
    document.getElementById("manageStockModal").style.display = "none";
    document.getElementById("fishCompatibility").innerHTML = "";
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

        const tankId = document.getElementById("modalTankId").value;
        await updateTankStockDisplay(tankId); // <== DODANE
      } catch (err) {
        console.error("Error loading fish data:", err);
      }
    });

  async function updateTankStockDisplay(tankId) {
    try {
      const tankId = document.getElementById("modalTankId").value;
      const fishId = document.getElementById("newFishSelect").value;

      const res = await fetch(`/tanks/tank_stock/${tankId}?fish_id=${fishId}`);

      const data = await res.json();

      const percent = (data.total_cm / data.tank_volume) * 100;

      // 🐟 Zaktualizuj total_cm (cm ryb w zbiorniku)
      document.querySelectorAll(".slide").forEach((slide) => {
        if (slide.dataset.tankId === tankId) {
          const percentSpan = slide.querySelector(`#stock-percent-${tankId}`);
          if (percentSpan) {
            percentSpan.textContent = `${percent.toFixed(0)}%`;
          }
        }
      });

      // 📢 Wyświetl informacje o zarybieniu i zgodności pod rybą
      const compatContainer = document.getElementById("fishCompatibility");
      if (!compatContainer) return;

      // Usuń stare info
      document.getElementById("compatibility-detail")?.remove();
      document.getElementById("stocking-detail")?.remove();

      // 💧 Zarybienie
      const stockingPercent = (data.total_cm / data.tank_volume) * 100;
      const stockingDiv = document.createElement("div");
      stockingDiv.id = "stocking-detail";
      stockingDiv.style.marginTop = "10px";
      stockingDiv.style.fontWeight = "500";
      stockingDiv.style.color = stockingPercent > 100 ? "#cc0000" : "#2e7d32";
      stockingDiv.innerHTML =
        stockingPercent > 100
          ? `❗ Overstocked: ${stockingPercent.toFixed(0)}% of tank volume`
          : `💧 Stocking: ${stockingPercent.toFixed(0)}% of tank volume`;
      compatContainer.appendChild(stockingDiv);

      // ⚠️ Kompatybilność
      if (data.mismatches) {
        const compatDiv = document.createElement("div");
        compatDiv.id = "compatibility-detail";
        compatDiv.style.marginTop = "5px";
        compatDiv.style.fontWeight = "500";
        compatDiv.style.color =
          data.mismatches.length === 0 ? "#2e7d32" : "#cc0000";
        compatDiv.innerHTML =
          data.mismatches.length === 0
            ? "✅ Suitable for this tank"
            : `⚠️ Not ideal for: ${data.mismatches.join(", ")}`;
        compatContainer.appendChild(compatDiv);
      }
    } catch (err) {
      console.error("Failed to update tank stock display:", err);
    }
  }

  // 🧠 Obsługa Settings Modal
  const settingsForm = document.getElementById("dailyChecksForm");
  const tankIdInput = document.getElementById("settingsTankId");

  function openSettingsModal(tankId) {
    document.getElementById("settingsModal").style.display = "block";
    tankIdInput.value = tankId;

    // 💡 Pobierz dane checks z odpowiedniego slajdu
    const slide = [...document.querySelectorAll(".slide")].find(
      (slide) => slide.dataset.tankId === tankId
    );

    const checks = slide?.dataset.checks ? JSON.parse(slide.dataset.checks) : [];

    // 💡 Zresetuj checkboxy w formularzu (odznacz wszystkie)
    const allCheckboxes = document.querySelectorAll('#dailyChecksForm input[name="checks"]');
    allCheckboxes.forEach(cb => {
      cb.checked = checks.includes(cb.value);
    });
  }


  settingsForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const tankId = tankIdInput.value;
    const selected = Array.from(
      settingsForm.querySelectorAll('input[name="checks"]:checked')
    ).map((cb) => cb.value);


    const formData = new FormData();
    formData.append("tank_id", tankId);
    selected.forEach((val) => formData.append("checks", val));

    try {
      const res = await fetch("/tanks/update_checks", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Daily checks saved!");

        // 🔁 Zaktualizuj data-checks dla danego slajdu
        const slide = [...getSlides()].find(
          (slide) => slide.dataset.tankId === tankId
        );
        if (slide) {
          slide.dataset.checks = JSON.stringify(selected);
        }

        document.getElementById("settingsModal").style.display = "none";
      } else {
        alert("Failed to save checks.");
      }
    } catch (err) {
      console.error("Error saving checks:", err);
      alert("Server error.");
    }
  });


  // 📌 Dodajemy eventy do przycisków "Settings"
  document.querySelectorAll(".settings-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slide = btn.closest(".slide");
      const tankId = slide.dataset.tankId;

      // 🛠 Ustaw slajd jako aktywny (by nie pobierać złych danych)
      const slides = getSlides();
      const index = slides.findIndex(s => s.dataset.tankId === tankId);
      if (index !== -1) {
        showSlide(index);
      }

      // ✅ Załaduj Daily Checks (z poprawnego slajdu)
      openSettingsModal(String(tankId));

      // ✅ Załaduj Important Tasks
      importantTankId.value = tankId;
      resetImportantTasks();

      const tasksDataAttr = slide.dataset.importantTasks;
      if (tasksDataAttr) {
        try {
          const savedTasks = JSON.parse(tasksDataAttr);
          for (const taskType in savedTasks) {
            const task = savedTasks[taskType];
            const checkbox = importantForm.querySelector(
              `input.task-toggle[value="${taskType}"]`
            );
            const optionsWrapper = checkbox?.closest(".important-task-item");
            if (checkbox && optionsWrapper) {
              checkbox.checked = true;
              optionsWrapper
                .querySelector(".task-options")
                ?.classList.remove("d-none");

              optionsWrapper.querySelector(
                `input[name="${taskType}_start"]`
              ).value = task.start_date;
              optionsWrapper.querySelector(
                `input[name="${taskType}_interval"]`
              ).value = task.interval_days;
            }
          }

        } catch (err) {
          console.error("Could not parse important tasks:", err);
        }
      }
    });
  });


  // === Important Tasks – pokaż opcje przy zaznaczeniu ===
  const importantForm = document.getElementById("importantTasksForm");

  if (importantForm) {
    const taskCheckboxes = importantForm.querySelectorAll(".task-toggle");

    taskCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const wrapper = checkbox.closest(".important-task-item");
        const options = wrapper.querySelector(".task-options");
        if (options) {
          options.classList.toggle("d-none", !checkbox.checked);
        }
      });
    });

    const importantTankId = document.getElementById("importantTasksTankId");
    function resetImportantTasks() {
      // Ukryj wszystkie pola opcji i odznacz checkboxy
      const allTaskItems = importantForm.querySelectorAll(
        ".important-task-item"
      );
      allTaskItems.forEach((item) => {
        const checkbox = item.querySelector(".task-toggle");
        const options = item.querySelector(".task-options");
        if (checkbox) checkbox.checked = false;
        if (options) options.classList.add("d-none");
      });
    }

    document.querySelectorAll(".settings-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slide = btn.closest(".slide");
        const tankId = slide.dataset.tankId;
        importantTankId.value = tankId;
        resetImportantTasks(); // domyślnie czyści wszystkie checkboxy i pola
      });
    });
  }

  // === Przełączanie zakładek w Settings Modal ===
  const tabButtons = document.querySelectorAll("#settingsTabNav .nav-link");
  const checksTab = document.getElementById("checksTab");
  const tasksTab = document.getElementById("tasksTab");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Dezaktywuj wszystkie
      tabButtons.forEach((btn) => btn.classList.remove("active"));

      // Ukryj wszystkie taby
      if (checksTab) checksTab.style.display = "none";
      if (tasksTab) tasksTab.style.display = "none";

      // Aktywuj kliknięty
      button.classList.add("active");

      // Pokaż odpowiedni tab
      const targetId = button.getAttribute("data-bs-target");
      const targetTab = document.querySelector(targetId);
      if (targetTab) {
        targetTab.style.display = "block";
      }
    });
  });

  function populateDailyChecks(tankChecks) {
    const checkboxes = document.querySelectorAll('#dailyChecksForm input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = tankChecks.includes(cb.value);
    });
  }
});
