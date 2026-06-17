document.addEventListener("DOMContentLoaded", () => {

  // If already logged in, redirect to dashboard
  if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("registerBtn").addEventListener("click", async () => {
    const name            = document.getElementById("name").value.trim();
    const email           = document.getElementById("email").value.trim();
    const password        = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Clear previous errors
    ["nameError","emailError","passwordError","confirmError","errorAlert"]
      .forEach(id => {
        const el = document.getElementById(id);
        el.textContent = "";
        el.classList.remove("show");
      });

    let valid = true;

    if (!name) {
      document.getElementById("nameError").textContent = "Name is required.";
      document.getElementById("nameError").classList.add("show");
      valid = false;
    }

    if (!email || !email.includes("@")) {
      document.getElementById("emailError").textContent = "Valid email is required.";
      document.getElementById("emailError").classList.add("show");
      valid = false;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      document.getElementById("passwordError").textContent =
        "Password needs 8+ chars, 1 uppercase, 1 number.";
      document.getElementById("passwordError").classList.add("show");
      valid = false;
    }

    if (password !== confirmPassword) {
      document.getElementById("confirmError").textContent = "Passwords do not match.";
      document.getElementById("confirmError").classList.add("show");
      valid = false;
    }

    if (!valid) return;

    const btn = document.getElementById("registerBtn");
    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
      const data = await authAPI.register(name, email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "projects.html";
    } catch (err) {
      const el = document.getElementById("errorAlert");
      el.textContent = err.message;
      el.classList.add("show");
      btn.disabled = false;
      btn.textContent = "Create Account";
    }
  });

  // Allow Enter key to submit
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("registerBtn").click();
  });

});
