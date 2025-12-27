/**
 * Nilai Manager - Handle CRUD operations for data penjualan
 */

class NilaiManager {
  constructor() {
    this.apiUrl = "api/nilai_api.php";
    this.produkList = [];
    this.nilaiList = [];
    this.init();
  }

  async init() {
    await this.loadProduk();
    await this.loadNilai();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = document.getElementById("formNilai");
    const searchInput = document.getElementById("searchPenjualan");

    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        this.handleSearch(e.target.value)
      );
    }
  }

  async loadProduk() {
    try {
      const response = await fetch("api/produk_api.php?action=getAll");
      const result = await response.json();

      if (result.success) {
        this.produkList = result.data;
        this.renderProdukDropdown();
      }
    } catch (error) {
      console.error("Error loading produk:", error);
    }
  }

  async loadNilai() {
    try {
      const response = await fetch(`${this.apiUrl}?action=getAll`);
      const result = await response.json();

      if (result.success) {
        this.nilaiList = result.data;
        this.renderTable();
      } else {
        this.showMessage("error", result.message || "Gagal memuat data");
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("error", "Gagal memuat data penjualan");
    }
  }

  renderProdukDropdown() {
    const select = document.getElementById("produkId");
    if (!select) return;

    const options = this.produkList
      .map(
        (produk) =>
          `<option value="${produk.id}">${produk.nama_produk}</option>`
      )
      .join("");

    select.innerHTML = '<option value="">-- Pilih Produk --</option>' + options;
  }

  renderTable(data = this.nilaiList) {
    const tbody = document.getElementById("nilaiTableBody");
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center">Belum ada data penjualan</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data
      .map(
        (item) => `
      <tr>
        <td>${item.nama_produk}</td>
        <td>${item.bulan}</td>
        <td>${item.tahun}</td>
        <td>${this.formatNumber(item.kuantitas)} unit</td>
        <td>Rp ${this.formatCurrency(item.pendapatan)}</td>
        <td>${parseFloat(item.margin || 0).toFixed(1)}%</td>
        <td>${parseFloat(item.kerusakan || 0).toFixed(1)}%</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="nilaiManager.editNilai(${item.id})">
              ✏️
            </button>
            <button class="btn-delete" onclick="nilaiManager.deleteNilai(${item.id})">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");
  }

  formatNumber(num) {
    return num ? parseFloat(num).toLocaleString("id-ID") : "0";
  }

  formatCurrency(num) {
    return num ? parseFloat(num).toLocaleString("id-ID") : "0";
  }

  async handleSubmit(e) {
    e.preventDefault();

    const id =
      document.getElementById("isEdit").value === "true"
        ? this.currentEditId
        : null;
    const produkId = document.getElementById("produkId").value;
    const bulan = document.getElementById("bulan").value;
    const tahun = document.getElementById("tahun").value;
    const kuantitas = document.getElementById("kuantitas").value;
    const pendapatan = document.getElementById("pendapatan").value;
    const margin = document.getElementById("margin").value;
    const kerusakan = document.getElementById("kerusakan").value;

    if (!produkId || !bulan || !tahun || !kuantitas || !pendapatan || !margin || !kerusakan) {
      this.showMessage("error", "Mohon lengkapi semua field yang wajib diisi!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("action", id ? "update" : "create");
      if (id) formData.append("id", id);
      formData.append("produk_id", produkId);
      formData.append("bulan", bulan);
      formData.append("tahun", tahun);
      formData.append("kuantitas", kuantitas);
      formData.append("pendapatan", pendapatan);
      formData.append("margin", margin);
      formData.append("kerusakan", kerusakan);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage(
          "success",
          id
            ? "Data penjualan berhasil diupdate!"
            : "Data penjualan berhasil ditambahkan!"
        );
        closeModal();
        this.loadNilai();
      } else {
        this.showMessage("error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("error", "Terjadi kesalahan saat menyimpan data");
    }
  }

  async editNilai(id) {
    try {
      const response = await fetch(`${this.apiUrl}?action=getById&id=${id}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;

        document.getElementById("modalTitle").textContent =
          "Edit Data Penjualan";
        document.getElementById("isEdit").value = "true";
        this.currentEditId = id;

        document.getElementById("produkId").value = data.produk_id;
        document.getElementById("bulan").value = data.bulan;
        document.getElementById("tahun").value = data.tahun;
        document.getElementById("kuantitas").value = data.kuantitas;
        document.getElementById("pendapatan").value = data.pendapatan;
        document.getElementById("margin").value = data.margin || 0;
        document.getElementById("kerusakan").value = data.kerusakan || 0;

        openModal();
      } else {
        this.showMessage("error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("error", "Gagal memuat data penjualan");
    }
  }

  async deleteNilai(id) {
    if (!confirm("Yakin ingin menghapus data penjualan ini?")) return;

    try {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("id", id);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage("success", "Data penjualan berhasil dihapus!");
        this.loadNilai();
      } else {
        this.showMessage("error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("error", "Gagal menghapus data");
    }
  }

  handleSearch(keyword) {
    const filtered = this.nilaiList.filter(
      (item) =>
        item.nama_produk.toLowerCase().includes(keyword.toLowerCase()) ||
        item.bulan.toLowerCase().includes(keyword.toLowerCase()) ||
        item.tahun.toString().includes(keyword)
    );
    this.renderTable(filtered);
  }

  resetForm() {
    const form = document.getElementById("formNilai");
    if (form) form.reset();

    document.getElementById("modalTitle").textContent = "Tambah Data Penjualan";
    document.getElementById("isEdit").value = "false";
    this.currentEditId = null;
  }

  showMessage(type, message) {
    const infoBox = document.getElementById("infoBox");
    const infoMessage = document.getElementById("infoMessage");

    if (!infoBox || !infoMessage) return;

    infoBox.className = `alert alert-${
      type === "success" ? "success" : "error"
    }`;
    infoMessage.textContent = message;
    infoBox.style.display = "flex";

    setTimeout(() => {
      infoBox.style.display = "none";
    }, 3000);
  }
}

// Initialize
let nilaiManager;
document.addEventListener("DOMContentLoaded", () => {
  nilaiManager = new NilaiManager();
  window.nilaiManager = nilaiManager;
});
