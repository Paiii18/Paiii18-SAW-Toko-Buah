/**
 * Login Module
 * Mengelola otentikasi pengguna
 */

class LoginManager {
  constructor() {
    this.form = document.getElementById("loginForm");
    this.errorMessage = document.getElementById("errorMessage");
    this.init();
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleLogin(e));
    this.checkExistingSession();
  }

  async handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!this.validateInput(username, password)) return;

    try {
      const response = await this.authenticate(username, password);

      if (response.success) {
        this.saveSession(response.data);
        this.redirectToDashboard();
      } else {
        this.showError(response.message);
      }
    } catch (error) {
      this.showError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      console.error("Login error:", error);
    }
  }

  validateInput(username, password) {
    if (username === "" || password === "") {
      this.showError("Username dan password harus diisi!");
      return false;
    }
    return true;
  }

  async authenticate(username, password) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch("api/login_api.php", {
      method: "POST",
      body: formData,
    });

    return await response.json();
  }

  saveSession(userData) {
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("isLoggedIn", "true");
  }

  checkExistingSession() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      this.redirectToDashboard();
    }
  }

  redirectToDashboard() {
    window.location.href = "home.html";
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add("show");

    setTimeout(() => {
      this.errorMessage.classList.remove("show");
    }, 3000);
  }
}

// Inisialisasi login saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  new LoginManager();
});
