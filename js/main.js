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
    this.setCurrentDate();
    this.initCharts();
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

  /**
   * Initialize charts
   */
  initCharts() {
    this.createSalesChart();
    this.createCategoryChart();
  }

  /**
   * Create Sales Bar Chart
   */
  createSalesChart() {
    const ctx = document.getElementById("salesChart");
    if (!ctx) return;

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Apel", "Jeruk", "Mangga", "Pisang", "Anggur", "Semangka"],
        datasets: [
          {
            label: "Volume Penjualan",
            data: [450, 380, 290, 650, 180, 95],
            backgroundColor: "#2d9a5f",
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: "#f0f0f0",
            },
            ticks: {
              font: {
                size: 12,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 12,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create Category Doughnut Chart
   */
  createCategoryChart() {
    const ctx = document.getElementById("categoryChart");
    if (!ctx) return;

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Apel", "Jeruk", "Mangga", "Pisang", "Semangka"],
        datasets: [
          {
            data: [25, 20, 15, 30, 10],
            backgroundColor: [
              "#2d9a5f",
              "#ff9800",
              "#ffc107",
              "#4caf50",
              "#8bc34a",
            ],
            borderWidth: 0,
            spacing: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              font: {
                size: 12,
              },
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
        },
      },
    });
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
  const mainContent = document.querySelector(".main-content");

  sidebar.classList.toggle("collapsed");

  if (sidebar.classList.contains("collapsed")) {
    mainContent.style.marginLeft = "70px";
  } else {
    mainContent.style.marginLeft = "250px";
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});
