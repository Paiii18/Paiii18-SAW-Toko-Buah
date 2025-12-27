/**
 * Laporan Manager - Handle report generation and printing
 */

class LaporanManager {
  constructor() {
    this.produkList = [];
    this.kriteriaList = [];
    this.penjualanList = [];
    this.sawResults = null;
    this.init();
  }

  async init() {
    await Promise.all([
      this.loadProduk(),
      this.loadKriteria(),
      this.loadPenjualan(),
      this.loadSAWResults(),
    ]);
  }

  async loadProduk() {
    try {
      const response = await fetch("api/produk_api.php?action=getAll");
      const result = await response.json();
      if (result.success) {
        this.produkList = result.data;
        this.renderProdukReport();
      }
    } catch (error) {
      console.error("Error loading produk:", error);
    }
  }

  async loadKriteria() {
    try {
      const response = await fetch("api/kriteria_api.php?action=getAll");
      const result = await response.json();
      if (result.success) {
        this.kriteriaList = result.data;
        this.renderKriteriaReport();
      }
    } catch (error) {
      console.error("Error loading kriteria:", error);
    }
  }

  async loadPenjualan() {
    try {
      const response = await fetch("api/nilai_api.php?action=getAll");
      const result = await response.json();
      if (result.success) {
        this.penjualanList = result.data;
        this.renderPenjualanReport();
      }
    } catch (error) {
      console.error("Error loading penjualan:", error);
    }
  }

  async loadSAWResults() {
    try {
      const response = await fetch("api/saw_api.php?action=getHistory");
      const result = await response.json();
      if (result.success) {
        this.sawResults = result.data;
        this.renderSAWReport();
      }
    } catch (error) {
      console.error("Error loading SAW results:", error);
    }
  }

  getReportHeader() {
    return `
      <div class="report-header">
        <h1>TOKO BUAH SEGAR MANIS</h1>
        <h2>Sistem Pendukung Keputusan</h2>
        <p>Pakar Ayam, Cibubur Country Green Park Avenue FM2 No.7 Belakang Fresh Market Blok FM2 No.7, Cikeas Udik, Kabupaten Bogor, Jawa Barat 16966</p>
      </div>
    `;
  }

  getReportDate() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return now.toLocaleDateString("id-ID", options);
  }

  getReportFooter() {
    return `
      <div class="report-footer">
        <div class="signature-box">
          <div class="title">Mengetahui,</div>
          <div class="name">Eko</div>
          <div style="font-size: 10pt; color: #666;">Pemilik Toko</div>
        </div>
        <div class="signature-box">
          <div class="title">Bogor, ${this.getReportDate()}</div>
          <div class="name">Fendi Dwi Prasetyo</div>
          <div style="font-size: 10pt; color: #666;">Administrator</div>
        </div>
      </div>
    `;
  }

  formatCurrency(num) {
    return num ? parseFloat(num).toLocaleString("id-ID") : "0";
  }

  renderProdukReport() {
    const paper = document.getElementById("paper-produk");
    if (!paper) return;

    let tableRows = "";
    this.produkList.forEach((produk, index) => {
      tableRows += `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${produk.kode_produk}</td>
          <td>${produk.nama_produk}</td>
          <td class="right">Rp ${this.formatCurrency(produk.harga)}</td>
          <td class="center">${produk.stok} unit</td>
        </tr>
      `;
    });

    paper.innerHTML = `
      ${this.getReportHeader()}
      <div class="report-title">
        <h3>LAPORAN DATA PRODUK</h3>
      </div>
      <div class="report-date">
        Tanggal Cetak: ${this.getReportDate()}
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 100px;">Kode</th>
            <th>Nama Produk</th>
            <th style="width: 120px;">Harga</th>
            <th style="width: 80px;">Stok</th>
          </tr>
        </thead>
        <tbody>
          ${
            tableRows ||
            '<tr><td colspan="5" class="center">Tidak ada data produk</td></tr>'
          }
        </tbody>
      </table>
      <p style="margin-top: 20px;">Total Produk: <strong>${
        this.produkList.length
      }</strong> item</p>
      ${this.getReportFooter()}
    `;
  }

  renderKriteriaReport() {
    const paper = document.getElementById("paper-kriteria");
    if (!paper) return;

    let tableRows = "";
    let totalBobot = 0;
    this.kriteriaList.forEach((kriteria, index) => {
      const bobot = parseFloat(kriteria.bobot);
      totalBobot += bobot;
      tableRows += `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${kriteria.kode_kriteria}</td>
          <td>${kriteria.nama_kriteria}</td>
          <td class="center">${bobot.toFixed(2)}</td>
          <td class="center">${kriteria.jenis.toUpperCase()}</td>
        </tr>
      `;
    });

    paper.innerHTML = `
      ${this.getReportHeader()}
      <div class="report-title">
        <h3>LAPORAN DATA KRITERIA</h3>
      </div>
      <div class="report-date">
        Tanggal Cetak: ${this.getReportDate()}
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 80px;">Kode</th>
            <th>Nama Kriteria</th>
            <th style="width: 80px;">Bobot</th>
            <th style="width: 100px;">Jenis</th>
          </tr>
        </thead>
        <tbody>
          ${
            tableRows ||
            '<tr><td colspan="5" class="center">Tidak ada data kriteria</td></tr>'
          }
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background: #f0f0f0;">
            <td colspan="3" class="right">Total Bobot:</td>
            <td class="center">${totalBobot.toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <div style="margin-top: 20px;">
        <p><strong>Keterangan Jenis Kriteria:</strong></p>
        <ul style="margin-left: 20px;">
          <li><strong>BENEFIT</strong>: Semakin besar nilai semakin baik</li>
          <li><strong>COST</strong>: Semakin kecil nilai semakin baik</li>
        </ul>
      </div>
      ${this.getReportFooter()}
    `;
  }

  renderPenjualanReport() {
    const paper = document.getElementById("paper-penjualan");
    if (!paper) return;

    let tableRows = "";
    this.penjualanList.forEach((item, index) => {
      tableRows += `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${item.nama_produk}</td>
          <td class="center">${item.bulan} ${item.tahun}</td>
          <td class="right">${parseFloat(item.kuantitas).toLocaleString(
            "id-ID"
          )}</td>
          <td class="right">Rp ${this.formatCurrency(item.pendapatan)}</td>
          <td class="center">${parseFloat(item.margin || 0).toFixed(1)}%</td>
          <td class="center">${parseFloat(item.kerusakan || 0).toFixed(1)}%</td>
        </tr>
      `;
    });

    paper.innerHTML = `
      ${this.getReportHeader()}
      <div class="report-title">
        <h3>LAPORAN DATA PENJUALAN</h3>
      </div>
      <div class="report-date">
        Tanggal Cetak: ${this.getReportDate()}
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th>Produk</th>
            <th style="width: 100px;">Periode</th>
            <th style="width: 80px;">Kuantitas</th>
            <th style="width: 110px;">Pendapatan</th>
            <th style="width: 60px;">Margin</th>
            <th style="width: 70px;">Kerusakan</th>
          </tr>
        </thead>
        <tbody>
          ${
            tableRows ||
            '<tr><td colspan="7" class="center">Tidak ada data penjualan</td></tr>'
          }
        </tbody>
      </table>
      <p style="margin-top: 20px;">Total Data: <strong>${
        this.penjualanList.length
      }</strong> record</p>
      ${this.getReportFooter()}
    `;
  }

  renderSAWReport() {
    const paper = document.getElementById("paper-saw");
    if (!paper) return;

    if (!this.sawResults || Object.keys(this.sawResults).length === 0) {
      paper.innerHTML = `
        ${this.getReportHeader()}
        <div class="report-title">
          <h3>LAPORAN HASIL PERHITUNGAN SAW</h3>
        </div>
        <div class="report-date">
          Tanggal Cetak: ${this.getReportDate()}
        </div>
        <p style="text-align: center; color: #999; margin: 50px 0;">
          Belum ada hasil perhitungan SAW. Silakan lakukan perhitungan terlebih dahulu.
        </p>
        ${this.getReportFooter()}
      `;
      return;
    }

    // Get the latest period
    const periods = Object.keys(this.sawResults).sort().reverse();
    const latestPeriod = periods[0];
    const latestResults = this.sawResults[latestPeriod];

    let tableRows = "";
    latestResults.forEach((item) => {
      let rankBadge = "";
      if (item.ranking === 1) {
        rankBadge = '<span class="ranking-badge rank-1">1</span>';
      } else if (item.ranking === 2) {
        rankBadge = '<span class="ranking-badge rank-2">2</span>';
      } else if (item.ranking === 3) {
        rankBadge = '<span class="ranking-badge rank-3">3</span>';
      } else {
        rankBadge = item.ranking;
      }

      let keterangan = "";
      if (item.ranking === 1) {
        keterangan = "Produk Terbaik";
      } else if (item.ranking === 2) {
        keterangan = "Direkomendasikan";
      } else if (item.ranking === 3) {
        keterangan = "Cukup Baik";
      } else {
        keterangan = "Perlu Evaluasi";
      }

      tableRows += `
        <tr>
          <td class="center">${rankBadge}</td>
          <td>${item.nama_produk}</td>
          <td class="center">${parseFloat(item.nilai_preferensi).toFixed(
            4
          )}</td>
          <td>${keterangan}</td>
        </tr>
      `;
    });

    paper.innerHTML = `
      ${this.getReportHeader()}
      <div class="report-title">
        <h3>LAPORAN HASIL PERHITUNGAN SAW</h3>
      </div>
      <div class="report-date">
        Tanggal Cetak: ${this.getReportDate()}
      </div>
      <p style="margin-bottom: 20px;"><strong>Periode:</strong> ${latestPeriod}</p>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 60px;">Ranking</th>
            <th>Nama Produk</th>
            <th style="width: 120px;">Nilai Preferensi</th>
            <th style="width: 150px;">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div style="margin-top: 30px;">
        <p><strong>Kesimpulan:</strong></p>
        <p style="margin-left: 20px; text-align: justify;">
          Berdasarkan perhitungan menggunakan metode Simple Additive Weighting (SAW)
          dengan mempertimbangkan kriteria Volume Penjualan, Pendapatan, Margin Keuntungan,
          Stok Tersedia, dan Tingkat Kerusakan, maka produk yang direkomendasikan untuk
          diprioritaskan adalah <strong>${
            latestResults[0]?.nama_produk || "-"
          }</strong>
          dengan nilai preferensi <strong>${parseFloat(
            latestResults[0]?.nilai_preferensi || 0
          ).toFixed(4)}</strong>.
        </p>
      </div>
      ${this.getReportFooter()}
    `;
  }
}

// Initialize
let laporanManager;
document.addEventListener("DOMContentLoaded", () => {
  laporanManager = new LaporanManager();
  window.laporanManager = laporanManager;
});
