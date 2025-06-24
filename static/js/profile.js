// 🌊 Sidebar toggle
const toggleButton = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

function updateSidebarState() {
  if (window.innerWidth > 991) {
    sidebar.classList.remove('collapsed');
  } else {
    sidebar.classList.add('collapsed');
  }
}

if (toggleButton && sidebar) {
  toggleButton.addEventListener('click', () => {
    if (window.innerWidth <= 991) {
      sidebar.classList.toggle('collapsed');
    }
  });
  updateSidebarState();
  window.addEventListener('resize', updateSidebarState);
}

// 🐠 Level modal
document.addEventListener('DOMContentLoaded', function () {
  const levelData = {
    1: {
      name: "Lil’ Plankton",
      description: "So small you need a magnifying glass to see yourself. But hey – size doesn’t bubble!",
      image: "/static/img/lil_plankton.png"
    },
    2: {
      name: "Plankton",
      description: "Still drifting aimlessly, but now with confidence. Occasionally bumps into snails.",
      image: "/static/img/plankton.png"
    },
    3: {
      name: "Plankton Pro",
      description: "Certified in Advanced Floating™. Can spin 360° while thinking about snacks.",
      image: "/static/img/plankton_pro.png"
    },
    4: {
      name: "Lil’ Shrimp",
      description: "Pew pew! Tiny claws, big dreams. Once challenged a bubble to a duel.",
      image: "/static/img/lil_shrimp.png"
    },
    5: {
      name: "Shrimp",
      description: "Now you're getting somewhere! Just try and avoid becoming someone's seafood pasta.",
      image: "/static/img/shrimp.png"
    },
    6: {
      name: "Master Shrimp",
      description: "Meditates under rocks. Has seen things… dark tank things.",
      image: "/static/img/master_shrimp.png"
    },
    7: {
      name: "Lil’ Fish",
      description: "Upgraded! Still scared of your reflection though.",
      image: "/static/img/lil_fish.png"
    },
    8: {
      name: "Fish",
      description: "Swims in circles for fun. Forgets why halfway through.",
      image: "/static/img/fish.png"
    },
    9: {
      name: "Fish Specialist",
      description: "Wears invisible glasses. Gives unsolicited filter advice to other fish.",
      image: "/static/img/fish_specialist.png"
    },
    10: {
      name: "Shark",
      description: "Alpha of the aquarium. Eats fear. Poops glitter.",
      image: "/static/img/shark.png"
    }
  };

  const levelButton = document.querySelector(".level-btn");
  const modal = document.getElementById("levelModal");

  if (levelButton && modal) {
    levelButton.addEventListener("click", () => {
      const levelId = levelButton.getAttribute("data-level");
      const level = levelData[levelId];
      if (level) {
        document.getElementById("modal-title").textContent = level.name;
        document.getElementById("modal-description").textContent = level.description;
        document.getElementById("modal-image").src = level.image;
        modal.style.display = "flex";
      }
    });

    document.querySelector(".close").addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

// 👁️ Toggle password visibility (naprawiona wersja)
document.querySelectorAll('.toggle-password').forEach(icon => {
  icon.addEventListener('click', () => {
    const input = icon.previousElementSibling;
    if (input && input.type) {
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('bi-eye');
      icon.classList.toggle('bi-eye-slash');
    }
  });
});



  // 🔐 Password strength indicator
  const newPasswordInput = document.getElementById("new_password");
  const strengthText = document.getElementById("passwordStrength");

  if (newPasswordInput && strengthText) {
    newPasswordInput.addEventListener("input", () => {
      const val = newPasswordInput.value;
      let strength = "Weak";
      let color = "red";

      if (val.length >= 12 && /[A-Z]/.test(val) && /[0-9]/.test(val)) {
        strength = "Strong";
        color = "green";
      } else if (val.length >= 6) {
        strength = "Medium";
        color = "orange";
      }

      strengthText.textContent = `Password strength: ${strength}`;
      strengthText.style.color = color;
    });
  }

  // ✅ Form validation
  const form = document.getElementById("changePasswordForm");
  const current = document.querySelector('input[name="current_password"]');
  const confirm = document.querySelector('input[name="confirm_password"]');

  if (form && current && newPasswordInput && confirm) {
    form.addEventListener("submit", (e) => {
      let errors = [];

      if (!current.value.trim()) errors.push("Current password is required.");
      if (!newPasswordInput.value.trim()) errors.push("New password is required.");
      if (newPasswordInput.value.length < 6 || newPasswordInput.value.length > 16) {
        errors.push("Password must be between 6 and 16 characters.");
      }
      if (newPasswordInput.value !== confirm.value) {
        errors.push("Passwords do not match.");
      }

      if (errors.length > 0) {
        e.preventDefault();
        alert(errors.join("\n"));
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const toggleIcons = document.querySelectorAll(".toggle-password");

  toggleIcons.forEach((icon) => {
    const input = icon.previousElementSibling; // zakładamy, że input jest tuż przed ikonką

    if (input) {
      icon.addEventListener("click", () => {
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        icon.classList.toggle("bi-eye");
        icon.classList.toggle("bi-eye-slash");
      });
    }
  });
});

