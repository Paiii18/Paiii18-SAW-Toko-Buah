/**
 * Main Dashboard Module
 * Handle dashboard functionality and data display
 */

class Dashboard {
  constructor() {
    this.produkData = [];
    this.penjualanData = [];
    this.sawData = null;
    this.init();
  }

  async init() {
    this.checkAuth();
    this.loadUserData();
    this.setCurrentDate();
    await this.loadDashboardData();
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
   * Load all dashboard data from APIs
   */
  async loadDashboardData() {
    try {
      // Fetch all data in parallel
      const [produkRes, penjualanRes, sawRes] = await Promise.all([
        fetch("api/produk_api.php?action=getAll"),
        fetch("api/nilai_api.php?action=getAll"),
        fetch("api/saw_api.php?action=getHistory"),
      ]);

      const produkResult = await produkRes.json();
      const penjualanResult = await penjualanRes.json();
      const sawResult = await sawRes.json();

      if (produkResult.success) {
        this.produkData = produkResult.data;
      }
      if (penjualanResult.success) {
        this.penjualanData = penjualanResult.data;
      }
      if (sawResult.success) {
        this.sawData = sawResult.data;
      }

      this.updateStats();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }

  /**
   * Update statistics cards with real data
   */
  updateStats() {
    // Total Produk
    const totalProdukEl = document.getElementById("totalProduk");
    if (totalProdukEl) {
      totalProdukEl.textContent = this.produkData.length;
    }

    // Total Penjualan (sum of kuantitas)
    const totalPenjualanEl = document.getElementById("totalPenjualan");
    if (totalPenjualanEl) {
      const totalKuantitas = this.penjualanData.reduce(
        (sum, item) => sum + parseInt(item.kuantitas || 0),
        0
      );
      totalPenjualanEl.textContent = totalKuantitas.toLocaleString("id-ID");
    }

    // Total Pendapatan
    const totalPendapatanEl = document.getElementById("totalPendapatan");
    if (totalPendapatanEl) {
      const totalPendapatan = this.penjualanData.reduce(
        (sum, item) => sum + parseFloat(item.pendapatan || 0),
        0
      );
      totalPendapatanEl.textContent =
        "Rp " + totalPendapatan.toLocaleString("id-ID");
    }

    // Produk Terbaik (from SAW results)
    const produkTerlarisEl = document.getElementById("produkTerlaris");
    if (produkTerlarisEl && this.sawData) {
      const periods = Object.keys(this.sawData);
      if (periods.length > 0) {
        const latestPeriod = periods.sort().reverse()[0];
        const topProduct = this.sawData[latestPeriod][0];
        if (topProduct) {
          produkTerlarisEl.textContent = topProduct.nama_produk;
        } else {
          produkTerlarisEl.textContent = "-";
        }
      } else {
        produkTerlarisEl.textContent = "-";
      }
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
   * Create Sales Bar Chart with real data
   */
  createSalesChart() {
    const ctx = document.getElementById("salesChart");
    if (!ctx) return;

    // Aggregate sales data by product
    const salesByProduct = {};
    this.penjualanData.forEach((item) => {
      if (!salesByProduct[item.nama_produk]) {
        salesByProduct[item.nama_produk] = 0;
      }
      salesByProduct[item.nama_produk] += parseInt(item.kuantitas || 0);
    });

    const labels = Object.keys(salesByProduct);
    const data = Object.values(salesByProduct);

    // If no data, show placeholder
    if (labels.length === 0) {
      ctx.parentElement.innerHTML =
        '<p style="text-align: center; color: #999; padding: 50px;">Belum ada data penjualan</p>';
      return;
    }

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Volume Penjualan",
            data: data,
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
   * Create Category Doughnut Chart with real data
   */
  createCategoryChart() {
    const ctx = document.getElementById("categoryChart");
    if (!ctx) return;

    // Aggregate revenue by product
    const revenueByProduct = {};
    this.penjualanData.forEach((item) => {
      if (!revenueByProduct[item.nama_produk]) {
        revenueByProduct[item.nama_produk] = 0;
      }
      revenueByProduct[item.nama_produk] += parseFloat(item.pendapatan || 0);
    });

    const labels = Object.keys(revenueByProduct);
    const data = Object.values(revenueByProduct);

    // If no data, show placeholder
    if (labels.length === 0) {
      ctx.parentElement.innerHTML =
        '<p style="text-align: center; color: #999; padding: 50px;">Belum ada data pendapatan</p>';
      return;
    }

    // Generate colors
    const colors = [
      "#2d9a5f",
      "#ff9800",
      "#ffc107",
      "#4caf50",
      "#8bc34a",
      "#03a9f4",
      "#9c27b0",
      "#e91e63",
      "#00bcd4",
      "#795548",
    ];

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors.slice(0, labels.length),
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
 * Toggle user dropdown menu
 */
function toggleUserDropdown(event) {
  if (event) {
    event.stopPropagation();
  }
  const dropdown = document.getElementById("userDropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("userDropdown");
  const userProfile = document.querySelector(".user-profile");
  if (dropdown && userProfile && !userProfile.contains(event.target)) {
    dropdown.classList.remove("show");
  }
});

/**
 * Handle logout functionality
 */
async function handleLogout() {
  if (!confirm("Apakah Anda yakin ingin keluar?")) {
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
 * Toggle sidebar - collapse on desktop, close on mobile
 */
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const overlay = document.querySelector(".sidebar-overlay");

  if (window.innerWidth > 1024) {
    // Desktop: collapse/expand sidebar
    sidebar.classList.toggle("collapsed");

    if (sidebar.classList.contains("collapsed")) {
      mainContent.style.marginLeft = "70px";
    } else {
      mainContent.style.marginLeft = "250px";
    }
  } else {
    // Mobile/Tablet: close the sidebar
    sidebar.classList.remove("open");
    if (overlay) {
      overlay.classList.remove("show");
    }
  }
}

/**
 * Toggle mobile sidebar (hamburger menu)
 */
function toggleMobileSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");

  sidebar.classList.toggle("open");
  if (overlay) {
    overlay.classList.toggle("show");
  }
}

/**
 * Close mobile sidebar
 */
function closeMobileSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");

  sidebar.classList.remove("open");
  if (overlay) {
    overlay.classList.remove("show");
  }
}

// Handle window resize - reset sidebar state when switching between mobile and desktop
window.addEventListener("resize", function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const overlay = document.querySelector(".sidebar-overlay");

  if (window.innerWidth > 1024) {
    // Desktop: remove mobile classes, apply proper margin
    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("show");

    if (!sidebar.classList.contains("collapsed")) {
      mainContent.style.marginLeft = "250px";
    }
  } else {
    // Mobile/Tablet: reset margin
    mainContent.style.marginLeft = "0";
  }
});

// Initialize dashboard when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});
