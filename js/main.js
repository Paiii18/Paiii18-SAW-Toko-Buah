/**
 * Main Dashboard Module
 * Handle dashboard functionality and data display
 */

class Dashboard {
  constructor() {
    this.init();
  }

  init() {
    this.checkAuth();
    this.loadUserData();
    this.loadDashboardStats();
    this.setCurrentDate();
  }

  /**
   * Check if user is authenticated
   */
  checkAuth() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn || isLoggedIn !== "true") {
      window.location.href = "login.html";
    }
  }

  /**
   * Load user data from session
   */
  loadUserData() {
    const userData = JSON.parse(sessionStorage.getItem("user") || "{}");

    if (userData.nama_lengkap) {
      const userNameElement = document.getElementById("userName");
      if (userNameElement) {
        userNameElement.textContent = userData.nama_lengkap;
      }

      // Set avatar initial
      const avatar = document.querySelector(".avatar");
      if (avatar && userData.nama_lengkap) {
        avatar.textContent = userData.nama_lengkap.charAt(0).toUpperCase();
      }
    }
  }

  /**
   * Load dashboard statistics from API
   */
  async loadDashboardStats() {
    try {
      // TODO: Implement actual API calls when ready
      // For now, using static data from HTML
      console.log("Dashboard stats loaded");
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  }

  /**
   * Set current date display
   */
  setCurrentDate() {
    const dateElement = document.getElementById("currentDate");
    if (dateElement) {
      const options = { year: "numeric", month: "long" };
      const currentDate = new Date().toLocaleDateString("id-ID", options);
      dateElement.textContent = currentDate;
    }
  }
}

/**
 * Handle logout functionality
 */
async function handleLogout() {
  if (!confirm("Apakah Anda yakin ingin logout?")) {
    return;
  }

  try {
    const response = await fetch("api/logout_api.php", {
      method: "POST",
    });

    const result = await response.json();

    if (result.success) {
      sessionStorage.clear();
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Force logout even if API fails
    sessionStorage.clear();
    window.location.href = "login.html";
  }
}

/**
 * Toggle sidebar (for mobile)
 */
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("collapsed");
}

// Initialize dashboard when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});
