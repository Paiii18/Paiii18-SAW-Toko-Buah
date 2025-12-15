/**
 * Kriteria Manager - Handle CRUD operations for kriteria
 */

class KriteriaManager {
  constructor() {
    this.apiUrl = "api/kriteria_api.php";
    this.kriteriaList = [];
    this.init();
  }

  async init() {
    await this.loadKriteria();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = document.getElementById("formKriteria");
    const searchInput = document.getElementById("searchKriteria");
    const filterSelect = document.getElementById("filterJenis");

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
      const response = await fetch(`${this.apiUrl}?action=getAll`);
      const result = await response.json();

      if (result.success) {
        this.kriteriaList = result.data;
        this.renderTable();
      } else {
        this.showMessage("error", result.message || "Gagal memuat data");
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("error", "Gagal memuat data kriteria");
    }
  }

  renderTable(data = this.kriteriaList) {
    const tbody = document.getElementById("kriteriaTableBody");
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">Belum ada data kriteria</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data
      .map(
        (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${item.kode_kriteria}</strong></td>
        <td>${item.nama_kriteria}</td>
        <td>${this.formatBobot(item.bobot)}</td>
        <td>
          <span class="badge ${
            item.jenis === "benefit" ? "badge-success" : "badge-warning"
          }">
            ${item.jenis === "benefit" ? "📈 Benefit" : "📉 Cost"}
          </span>
        </td>
        <td>${item.keterangan || "-"}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="kriteriaManager.editKriteria(${
              item.id
            })">
              Edit
            </button>
            <button class="btn-delete" onclick="kriteriaManager.deleteKriteria(${
              item.id
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

  formatBobot(bobot) {
    return bobot ? `${parseFloat(bobot).toFixed(2)}%` : "0.00%";
  }

  async handleSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("kriteriaId").value;
    const kodeKriteria = document.getElementById("kodeKriteria").value.trim();
    const namaKriteria = document.getElementById("namaKriteria").value.trim();
    const jenis = document.getElementById("jenis").value;
    const keterangan = document.getElementById("keterangan").value.trim();

    if (!kodeKriteria || !namaKriteria || !jenis) {
      this.showMessage("error", "Mohon lengkapi semua field yang wajib diisi!");
      return;
    }

    const formData = new FormData();
    formData.append("action", id ? "update" : "create");
    if (id) formData.append("id", id);
    formData.append("kode_kriteria", kodeKriteria);
    formData.append("nama_kriteria", namaKriteria);
    formData.append("jenis", jenis);
    formData.append("keterangan", keterangan);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage(
          "success",
          id ? "Kriteria berhasil diupdate!" : "Kriteria berhasil ditambahkan!"
        );
        closeModal();
        this.loadKriteria();
      } else {
        this.showMessage("error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("error", "Terjadi kesalahan saat menyimpan data");
    }
  }

  async editKriteria(id) {
    try {
      const response = await fetch(`${this.apiUrl}?action=getById&id=${id}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;

        document.getElementById("modalTitle").textContent = "Edit Kriteria";
        document.getElementById("kriteriaId").value = data.id;
        document.getElementById("kodeKriteria").value = data.kode_kriteria;
        document.getElementById("namaKriteria").value = data.nama_kriteria;
        document.getElementById("jenis").value = data.jenis;
        document.getElementById("keterangan").value = data.keterangan || "";

        openModal();
      } else {
        this.showMessage("error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("error", "Gagal memuat data kriteria");
    }
  }

  async deleteKriteria(id) {
    if (!confirm("Yakin ingin menghapus kriteria ini?")) return;

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
        this.showMessage("success", "Kriteria berhasil dihapus!");
        this.loadKriteria();
      } else {
        this.showMessage("error", result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("error", "Gagal menghapus data");
    }
  }

  handleSearch(keyword) {
    const filtered = this.kriteriaList.filter(
      (item) =>
        item.kode_kriteria.toLowerCase().includes(keyword.toLowerCase()) ||
        item.nama_kriteria.toLowerCase().includes(keyword.toLowerCase())
    );
    this.renderTable(filtered);
  }

  handleFilter(jenis) {
    if (!jenis) {
      this.renderTable();
      return;
    }

    const filtered = this.kriteriaList.filter((item) => item.jenis === jenis);
    this.renderTable(filtered);
  }

  resetForm() {
    const form = document.getElementById("formKriteria");
    if (form) form.reset();

    document.getElementById("modalTitle").textContent = "Tambah Kriteria";
    document.getElementById("kriteriaId").value = "";
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
let kriteriaManager;
document.addEventListener("DOMContentLoaded", () => {
  kriteriaManager = new KriteriaManager();
  window.kriteriaManager = kriteriaManager;
});
