/**
 * Nilai Manager - Handle CRUD operations for penilaian
 */

class NilaiManager {
  constructor() {
    this.apiUrl = "api/nilai_api.php";
    this.produkList = [];
    this.kriteriaList = [];
    this.nilaiList = [];
    this.init();
  }

  async init() {
    await this.loadKriteria();
    await this.loadProduk();
    await this.loadNilai();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = document.getElementById("formNilai");
    const searchInput = document.getElementById("searchNilai");
    const filterSelect = document.getElementById("filterKategori");

    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        this.handleSearch(e.target.value)
      );
    }

    if (filterSelect) {
      filterSelect.addEventListener("change", (e) =>
        this.handleFilter(e.target.value)
      );
    }
  }

  async loadKriteria() {
    try {
      const response = await fetch("api/kriteria_api.php?action=getAll");
      const result = await response.json();

      if (result.success) {
        this.kriteriaList = result.data;
        this.renderKriteriaHeaders();
        this.renderKriteriaInputs();
      }
    } catch (error) {
      console.error("Error loading kriteria:", error);
    }
  }

  async loadProduk() {
    try {
      const response = await fetch("api/produk_api.php?action=getAll");
      const result = await response.json();

      if (result.success) {
        this.produkList = result.data;
        this.renderProdukDropdown();
        this.renderFilterDropdown();
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
      this.showMessage("error", "Gagal memuat data nilai");
    }
  }

  renderKriteriaHeaders() {
    this.kriteriaList.forEach((kriteria, index) => {
      const header = document.getElementById(`headerC${index + 1}`);
      if (header) {
        header.textContent = kriteria.kode_kriteria;
        header.title = kriteria.nama_kriteria;
      }
    });
  }

  renderKriteriaInputs() {
    const container = document.getElementById("kriteriaInputs");
    if (!container) return;

    container.innerHTML = this.kriteriaList
      .map(
        (kriteria) => `
      <div class="form-group">
        <label for="nilai_${kriteria.id}">
          ${kriteria.kode_kriteria} - ${kriteria.nama_kriteria}
          <span class="required">*</span>
        </label>
        <input
          type="number"
          id="nilai_${kriteria.id}"
          name="nilai_${kriteria.id}"
          step="0.01"
          required
          placeholder="Masukkan nilai"
        />
      </div>
    `
      )
      .join("");
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

  renderFilterDropdown() {
    const select = document.getElementById("filterKategori");
    if (!select) return;

    const options = this.produkList
      .map(
        (produk) =>
          `<option value="${produk.id}">${produk.nama_produk}</option>`
      )
      .join("");

    select.innerHTML = '<option value="">Semua Produk</option>' + options;
  }

  renderTable(data = this.nilaiList) {
    const tbody = document.getElementById("nilaiTableBody");
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center">Belum ada data penilaian</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data
      .map(
        (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nama_produk}</td>
        <td>${this.formatNilai(item.nilai_c1)}</td>
        <td>${this.formatNilai(item.nilai_c2)}</td>
        <td>${this.formatNilai(item.nilai_c3)}</td>
        <td>${this.formatNilai(item.nilai_c4)}</td>
        <td>${this.formatNilai(item.nilai_c5)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="nilaiManager.editNilai(${
              item.produk_id
            })">
              Edit
            </button>
            <button class="btn-delete" onclick="nilaiManager.deleteNilai(${
              item.produk_id
            })">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");
  }

  formatNilai(nilai) {
    return nilai ? parseFloat(nilai).toFixed(2) : "0.00";
  }

  async handleSubmit(e) {
    e.preventDefault();

    const produkId = document.getElementById("produkId").value;
    const isEdit = document.getElementById("isEdit").value === "true";

    if (!produkId) {
      this.showMessage("error", "Pilih produk terlebih dahulu!");
      return;
    }

    const nilaiData = this.kriteriaList.map((kriteria) => ({
      kriteria_id: kriteria.id,
      nilai: document.getElementById(`nilai_${kriteria.id}`).value,
    }));

    try {
      const formData = new FormData();
      formData.append("action", "save");
      formData.append("produk_id", produkId);
      formData.append("nilai_data", JSON.stringify(nilaiData));

      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage(
          "success",
          isEdit ? "Nilai berhasil diupdate!" : "Nilai berhasil ditambahkan!"
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

  async editNilai(produkId) {
    try {
      const response = await fetch(
        `${this.apiUrl}?action=getByProduk&produk_id=${produkId}`
      );
      const result = await response.json();

      if (result.success) {
        document.getElementById("modalTitle").textContent =
          "Edit Nilai Penilaian";
        document.getElementById("isEdit").value = "true";
        document.getElementById("produkId").value = produkId;
        document.getElementById("produkId").disabled = true;

        result.data.forEach((item) => {
          const input = document.getElementById(`nilai_${item.kriteria_id}`);
          if (input) {
            input.value = item.nilai;
          }
        });

        openModal();
      } else {
        this.showMessage("error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("error", "Gagal memuat data nilai");
    }
  }

  async deleteNilai(produkId) {
    if (!confirm("Yakin ingin menghapus semua nilai produk ini?")) return;

    try {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("produk_id", produkId);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage("success", "Nilai berhasil dihapus!");
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
    const filtered = this.nilaiList.filter((item) =>
      item.nama_produk.toLowerCase().includes(keyword.toLowerCase())
    );
    this.renderTable(filtered);
  }

  handleFilter(produkId) {
    if (!produkId) {
      this.renderTable();
      return;
    }

    const filtered = this.nilaiList.filter(
      (item) => item.produk_id == produkId
    );
    this.renderTable(filtered);
  }

  resetForm() {
    const form = document.getElementById("formNilai");
    if (form) form.reset();

    document.getElementById("modalTitle").textContent =
      "Tambah Nilai Penilaian";
    document.getElementById("isEdit").value = "false";
    document.getElementById("produkId").disabled = false;
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
