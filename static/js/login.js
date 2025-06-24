document.addEventListener("DOMContentLoaded", function () {
  const toggleLogin = document.getElementById("toggleLoginPassword");
  const inputPassword = document.getElementById("loginPassword");
  const inputLogin = document.getElementById("login");
  const registerBtn = document.querySelector(".btn-info");

  if (toggleLogin && inputPassword) {
    toggleLogin.addEventListener("click", function () {
      const type = inputPassword.getAttribute("type") === "password" ? "text" : "password";
      inputPassword.setAttribute("type", type);
      toggleLogin.classList.toggle("bi-eye");
      toggleLogin.classList.toggle("bi-eye-slash");
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "registration.html";
    });
  }

  inputLogin.addEventListener("input", function () {
    if (inputLogin.value.length < 4 || inputLogin.value.length > 16) {
      inputLogin.setCustomValidity("Login must be 4–16 characters.");
    } else {
      inputLogin.setCustomValidity("");
    }
  });

  inputPassword.addEventListener("input", function () {
    if (inputPassword.value.length < 6 || inputPassword.value.length > 16) {
      inputPassword.setCustomValidity("Password must be 6–16 characters.");
    } else {
      inputPassword.setCustomValidity("");
    }
  });

  // 🧠 TO JEST KLUCZOWE – bez tego dymek się nie pokaże
  const form = document.querySelector("form");
  form.addEventListener("submit", function (event) {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
});
