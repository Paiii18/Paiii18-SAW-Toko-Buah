/**
 * SAW Manager - Handle SAW calculation and display
 */

class SAWManager {
  constructor() {
    this.apiUrl = "api/saw_api.php";
    this.kriteria = [];
    this.produk = [];
    this.results = null;
    this.init();
  }

  async init() {
    await this.loadKriteria();
  }

  async loadKriteria() {
    try {
      const response = await fetch("api/kriteria_api.php?action=getAll");
      const result = await response.json();

      if (result.success) {
        this.kriteria = result.data;
        this.renderKriteriaTable();
      }
    } catch (error) {
      console.error("Error loading kriteria:", error);
      this.showAlert("error", "Gagal memuat data kriteria");
    }
  }

  renderKriteriaTable() {
    const tbody = document.getElementById("kriteriaBody");
    if (!tbody) return;

    if (this.kriteria.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Tidak ada data kriteria</td></tr>';
      return;
    }

    tbody.innerHTML = this.kriteria
      .map(
        (k) => `
      <tr>
        <td><strong>${k.kode_kriteria}</strong></td>
        <td>${k.nama_kriteria}</td>
        <td>${parseFloat(k.bobot).toFixed(2)}</td>
        <td>
          <span class="kriteria-badge ${
            k.jenis === "benefit" ? "badge-benefit" : "badge-cost"
          }">
            ${k.jenis.toUpperCase()}
          </span>
        </td>
      </tr>
    `
      )
      .join("");
  }

  async calculate() {
    this.showAlert("info", "Sedang menghitung...");

    try {
      const formData = new FormData();
      formData.append("action", "calculate");
      formData.append("periode", this.getCurrentPeriode());

      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.results = result.data;
        this.kriteria = result.data.kriteria;
        this.renderAllTables();
        this.showAlert(
          "success",
          "Perhitungan SAW berhasil! Produk terbaik: " +
            result.data.results[0].nama
        );
      } else {
        this.showAlert("error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showAlert("error", "Terjadi kesalahan saat perhitungan");
    }
  }

  getCurrentPeriode() {
    const now = new Date();
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  renderAllTables() {
    if (!this.results) return;

    this.renderMatrixTable();
    this.renderNormalizedTable();
    this.renderWeightedTable();
    this.renderRankingTable();

    // Show hidden sections
    document.getElementById("sectionNormalized").style.display = "block";
    document.getElementById("sectionWeighted").style.display = "block";
    document.getElementById("sectionRanking").style.display = "block";
  }

  renderMatrixTable() {
    const thead = document.getElementById("matrixHead");
    const tbody = document.getElementById("matrixBody");
    const matrix = this.results.matrix;

    // Header
    let headerHtml = "<tr><th>Alternatif</th>";
    this.kriteria.forEach((k) => {
      headerHtml += `<th>${k.kode_kriteria}</th>`;
    });
    headerHtml += "</tr>";
    thead.innerHTML = headerHtml;

    // Body
    let bodyHtml = "";
    matrix.forEach((row) => {
      bodyHtml += `<tr><td><strong>${row.nama}</strong></td>`;
      this.kriteria.forEach((k) => {
        const nilai = row.nilai[k.kode_kriteria] || 0;
        bodyHtml += `<td>${this.formatNumber(nilai)}</td>`;
      });
      bodyHtml += "</tr>";
    });

    // Max/Min row
    bodyHtml += '<tr style="background: #e8f5e9; font-weight: bold;"><td>Max/Min</td>';
    this.kriteria.forEach((k) => {
      const mm = this.results.maxMin[k.kode_kriteria];
      if (k.jenis === "benefit") {
        bodyHtml += `<td>Max: ${this.formatNumber(mm.max)}</td>`;
      } else {
        bodyHtml += `<td>Min: ${this.formatNumber(mm.min)}</td>`;
      }
    });
    bodyHtml += "</tr>";

    tbody.innerHTML = bodyHtml;
  }

  renderNormalizedTable() {
    const thead = document.getElementById("normalizedHead");
    const tbody = document.getElementById("normalizedBody");
    const normalized = this.results.normalized;

    // Header
    let headerHtml = "<tr><th>Alternatif</th>";
    this.kriteria.forEach((k) => {
      headerHtml += `<th>${k.kode_kriteria}</th>`;
    });
    headerHtml += "</tr>";
    thead.innerHTML = headerHtml;

    // Body
    let bodyHtml = "";
    normalized.forEach((row) => {
      bodyHtml += `<tr><td><strong>${row.nama}</strong></td>`;
      this.kriteria.forEach((k) => {
        const nilai = parseFloat(row.nilai[k.kode_kriteria]) || 0;
        bodyHtml += `<td>${nilai.toFixed(4)}</td>`;
      });
      bodyHtml += "</tr>";
    });

    tbody.innerHTML = bodyHtml;
  }

  renderWeightedTable() {
    const thead = document.getElementById("weightedHead");
    const tbody = document.getElementById("weightedBody");
    const results = this.results.results;

    // Header with weights
    let headerHtml = "<tr><th>Alternatif</th>";
    this.kriteria.forEach((k) => {
      headerHtml += `<th>${k.kode_kriteria} (${parseFloat(k.bobot).toFixed(
        2
      )})</th>`;
    });
    headerHtml += "<th>Total (Vi)</th></tr>";
    thead.innerHTML = headerHtml;

    // Body
    let bodyHtml = "";
    results.forEach((row) => {
      bodyHtml += `<tr><td><strong>${row.nama}</strong></td>`;
      this.kriteria.forEach((k) => {
        const nilai = parseFloat(row.weighted[k.kode_kriteria]) || 0;
        bodyHtml += `<td>${nilai.toFixed(4)}</td>`;
      });
      const preferensi = parseFloat(row.preferensi) || 0;
      bodyHtml += `<td><strong>${preferensi.toFixed(4)}</strong></td>`;
      bodyHtml += "</tr>";
    });

    tbody.innerHTML = bodyHtml;
  }

  renderRankingTable() {
    const tbody = document.getElementById("rankingBody");
    const results = this.results.results;

    tbody.innerHTML = results
      .map((row) => {
        let rowClass = "";
        let medal = "";
        let keterangan = "";

        if (row.ranking === 1) {
          rowClass = "ranking-1";
          medal = "🥇";
          keterangan = "Produk Terbaik - Sangat Direkomendasikan";
        } else if (row.ranking === 2) {
          rowClass = "ranking-2";
          medal = "🥈";
          keterangan = "Produk Bagus - Direkomendasikan";
        } else if (row.ranking === 3) {
          rowClass = "ranking-3";
          medal = "🥉";
          keterangan = "Produk Cukup Baik";
        } else {
          keterangan = "Perlu Evaluasi";
        }

        const preferensi = parseFloat(row.preferensi) || 0;
        return `
        <tr class="${rowClass}">
          <td>${medal} ${row.ranking}</td>
          <td><strong>${row.nama}</strong></td>
          <td class="result-highlight">${preferensi.toFixed(4)}</td>
          <td>${keterangan}</td>
        </tr>
      `;
      })
      .join("");
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + " Juta";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + " Ribu";
    }
    return num.toLocaleString("id-ID");
  }

  showAlert(type, message) {
    const alertBox = document.getElementById("alertBox");
    const alertIcon = document.getElementById("alertIcon");
    const alertMessage = document.getElementById("alertMessage");

    if (!alertBox) return;

    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    const classes = {
      success: "alert-success",
      error: "alert-error",
      warning: "alert-warning",
      info: "alert-info",
    };

    alertBox.className = `alert ${classes[type] || "alert-info"}`;
    alertIcon.textContent = icons[type] || "ℹ️";
    alertMessage.textContent = message;
    alertBox.style.display = "flex";

    if (type !== "info") {
      setTimeout(() => {
        alertBox.style.display = "none";
      }, 5000);
    }
  }
}

// Initialize
let sawManager;
document.addEventListener("DOMContentLoaded", () => {
  sawManager = new SAWManager();
  window.sawManager = sawManager;
});

// Global function for button
function calculateSAW() {
  if (sawManager) {
    sawManager.calculate();
  }
}
