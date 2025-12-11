/**
 * Produk Module
 * Handle CRUD operations for products
 */

class ProdukManager {
  constructor() {
    this.apiUrl = "api/produk_api.php";
    this.currentId = null;
    console.log("ProdukManager initialized");
    this.init();
  }

  init() {
    console.log("Init called");
    this.loadData();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Form submit
    const form = document.getElementById("formProduk");
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
      console.log("Form event listener attached");
    } else {
      console.error("Form not found!");
    }

    // Search
    const searchInput = document.getElementById("searchProduk");
    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        this.handleSearch(e.target.value)
      );
    }

    // Filter kategori
    const filterKategori = document.getElementById("filterKategori");
    if (filterKategori) {
      filterKategori.addEventListener("change", (e) =>
        this.handleFilter(e.target.value)
      );
    }
  }

  /**
   * Load all products
   */
  async loadData() {
    console.log("=== LOAD DATA ===");
    console.log("Fetching from:", `${this.apiUrl}?action=getAll`);

    try {
      const response = await fetch(`${this.apiUrl}?action=getAll`);
      console.log("Response status:", response.status);

      const result = await response.json();
      console.log("Response data:", result);

      if (result.success) {
        this.renderTable(result.data);
      } else {
        this.showError("Gagal memuat data produk");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      this.showError("Terjadi kesalahan saat memuat data");
    }
  }

  /**
   * Render table with products data
   */
  renderTable(data) {
    console.log("Rendering table with data:", data);
    const tbody = document.getElementById("produkTableBody");

    if (!tbody) {
      console.error("Table body not found!");
      return;
    }

    if (!data || data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center">Tidak ada data produk</td></tr>';
      return;
    }

    tbody.innerHTML = data
      .map(
        (item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.kode_produk}</td>
                <td>${item.nama_produk}</td>
                <td>${item.kategori || "-"}</td>
                <td>${item.satuan || "-"}</td>
                <td>${item.keterangan || "-"}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="window.produkManager.edit(${
                          item.id
                        })">
                            ✏️ Edit
                        </button>
                        <button class="btn-delete" onclick="window.produkManager.delete(${
                          item.id
                        }, '${item.nama_produk}')">
                            🗑️ Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
  }

  /**
   * Handle form submit (create/update)
   */
  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("action", this.currentId ? "update" : "create");
    formData.append("kode_produk", document.getElementById("kodeProduk").value);
    formData.append("nama_produk", document.getElementById("namaProduk").value);
    formData.append("kategori", document.getElementById("kategori").value);
    formData.append("satuan", document.getElementById("satuan").value);
    formData.append("keterangan", document.getElementById("keterangan").value);

    if (this.currentId) {
      formData.append("id", this.currentId);
    }

    // Debug: Log form data
    console.log("=== SUBMIT DATA ===");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      console.log("Sending request to:", this.apiUrl);
      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (result.success) {
        this.showSuccess(result.message);
        closeModal();
        this.loadData();
        this.resetForm();
      } else {
        this.showError(result.message);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      this.showError("Terjadi kesalahan saat menyimpan data");
    }
  }

  /**
   * Edit product
   */
  async edit(id) {
    try {
      const response = await fetch(`${this.apiUrl}?action=getById&id=${id}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        this.currentId = id;

        document.getElementById("modalTitle").textContent = "Edit Produk";
        document.getElementById("produkId").value = data.id;
        document.getElementById("kodeProduk").value = data.kode_produk;
        document.getElementById("namaProduk").value = data.nama_produk;
        document.getElementById("kategori").value = data.kategori || "";
        document.getElementById("satuan").value = data.satuan || "";
        document.getElementById("keterangan").value = data.keterangan || "";

        openModal();
      } else {
        this.showError("Gagal memuat data produk");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      this.showError("Terjadi kesalahan saat memuat data");
    }
  }

  /**
   * Delete product
   */
  async delete(id, nama) {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${nama}"?`)) {
      return;
    }

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
        this.showSuccess(result.message);
        this.loadData();
      } else {
        this.showError(result.message);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      this.showError("Terjadi kesalahan saat menghapus data");
    }
  }

  /**
   * Handle search
   */
  handleSearch(keyword) {
    const rows = document.querySelectorAll("#produkTableBody tr");
    const searchLower = keyword.toLowerCase();

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchLower) ? "" : "none";
    });
  }

  /**
   * Handle filter by category
   */
  handleFilter(kategori) {
    const rows = document.querySelectorAll("#produkTableBody tr");

    rows.forEach((row) => {
      if (!kategori) {
        row.style.display = "";
        return;
      }

      const cells = row.getElementsByTagName("td");
      if (cells.length > 3) {
        const rowKategori = cells[3].textContent;
        row.style.display = rowKategori === kategori ? "" : "none";
      }
    });
  }

  /**
   * Reset form
   */
  resetForm() {
    this.currentId = null;
    const form = document.getElementById("formProduk");
    if (form) {
      form.reset();
    }
    document.getElementById("modalTitle").textContent = "Tambah Produk";
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    alert("✅ " + message);
  }

  /**
   * Show error message
   */
  showError(message) {
    alert("❌ " + message);
  }
}

// Initialize when DOM is ready and expose to global scope
console.log("produk.js loaded");
window.produkManager = new ProdukManager();
console.log("produkManager created:", window.produkManager);
