function checkPasswordStrength() {
  const password = document.getElementById("password").value;
  const strengthDisplay = document.getElementById("passwordStrength");
  let strength = 0;

  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (password.length === 0) {
    strengthDisplay.innerText = "";
    strengthDisplay.style.color = "";
  } else if (strength <= 1) {
    strengthDisplay.innerText = "Weak";
    strengthDisplay.style.color = "red";
  } else if (strength === 2 || strength === 3) {
    strengthDisplay.innerText = "Medium";
    strengthDisplay.style.color = "orange";
  } else {
    strengthDisplay.innerText = "Strong";
    strengthDisplay.style.color = "green";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Oko do hasła
  const toggle = document.getElementById("togglePassword");
  const input = document.getElementById("password");

  if (toggle && input) {
    toggle.addEventListener("click", function () {
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
      toggle.classList.toggle("bi-eye");
      toggle.classList.toggle("bi-eye-slash");
    });
  }

  // Oko do potwierdzenia hasła
  const toggleConfirm = document.getElementById("toggleConfirmPassword");
  const inputConfirm = document.getElementById("confirmPassword");

  if (toggleConfirm && inputConfirm) {
    toggleConfirm.addEventListener("click", function () {
      const type = inputConfirm.getAttribute("type") === "password" ? "text" : "password";
      inputConfirm.setAttribute("type", type);
      toggleConfirm.classList.toggle("bi-eye");
      toggleConfirm.classList.toggle("bi-eye-slash");
    });
  }

  // Walidacja długości + zgodność haseł
  const nameInput = document.querySelector('input[name="name"]');
  const loginInput = document.querySelector('input[name="login"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const confirmInput = document.querySelector('input[name="confirm_password"]');

  function validateLength(input, min, max, label) {
    input.addEventListener("input", () => {
      const value = input.value.trim();
      if (value.length < min) {
        input.setCustomValidity(`${label} must be at least ${min} characters.`);
      } else if (value.length > max) {
        input.setCustomValidity(`${label} must be no more than ${max} characters.`);
      } else {
        input.setCustomValidity("");
      }
    });
  }

  validateLength(nameInput, 2, 16, "Name");
  validateLength(loginInput, 4, 16, "Login");
  validateLength(passwordInput, 6, 16, "Password");

  confirmInput.addEventListener("input", () => {
    if (confirmInput.value !== passwordInput.value) {
      confirmInput.setCustomValidity("Passwords do not match.");
    } else {
      confirmInput.setCustomValidity("");
    }
  });
});
