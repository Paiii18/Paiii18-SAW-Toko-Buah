<?php
/**
 * Produk API
 * Handle CRUD operations for products
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

require_once 'config.php';

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

try {
    $database = new Database();
    $conn = $database->getConnection();

    switch ($action) {
        case 'getAll':
            getAllProduk($conn);
            break;
        
        case 'getById':
            getProdukById($conn);
            break;
        
        case 'create':
            createProduk($conn);
            break;
        
        case 'update':
            updateProduk($conn);
            break;
        
        case 'delete':
            deleteProduk($conn);
            break;
        
        default:
            sendResponse(false, 'Invalid action');
            break;
    }

} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage());
}

/**
 * Get all products
 */
function getAllProduk($conn) {
    $query = "SELECT * FROM produk ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(true, 'Data berhasil dimuat', $data);
}

/**
 * Get product by ID
 */
function getProdukById($conn) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        sendResponse(false, 'ID produk tidak ditemukan');
    }
    
    $query = "SELECT * FROM produk WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        sendResponse(true, 'Data berhasil dimuat', $data);
    } else {
        sendResponse(false, 'Produk tidak ditemukan');
    }
}

/**
 * Create new product
 */
function createProduk($conn) {
    // Validate input
    $kode_produk = isset($_POST['kode_produk']) ? trim($_POST['kode_produk']) : '';
    $nama_produk = isset($_POST['nama_produk']) ? trim($_POST['nama_produk']) : '';
    $kategori = isset($_POST['kategori']) ? trim($_POST['kategori']) : '';
    $satuan = isset($_POST['satuan']) ? trim($_POST['satuan']) : '';
    $harga = isset($_POST['harga']) ? trim($_POST['harga']) : 0;
    $stok = isset($_POST['stok']) ? trim($_POST['stok']) : 0;
    
    if (empty($kode_produk) || empty($nama_produk)) {
        sendResponse(false, 'Kode produk dan nama produk harus diisi!');
    }
    
    // Check if kode_produk already exists
    $checkQuery = "SELECT id FROM produk WHERE kode_produk = :kode_produk";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':kode_produk', $kode_produk);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendResponse(false, 'Kode produk sudah digunakan!');
    }
    
    // Insert data
    $query = "INSERT INTO produk (kode_produk, nama_produk, kategori, satuan, harga, stok) 
              VALUES (:kode_produk, :nama_produk, :kategori, :satuan, :harga, :stok)";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':kode_produk', $kode_produk);
    $stmt->bindParam(':nama_produk', $nama_produk);
    $stmt->bindParam(':kategori', $kategori);
    $stmt->bindParam(':satuan', $satuan);
    $stmt->bindParam(':harga', $harga);
    $stmt->bindParam(':stok', $stok);
    
    if ($stmt->execute()) {
        sendResponse(true, 'Produk berhasil ditambahkan!');
    } else {
        sendResponse(false, 'Gagal menambahkan produk');
    }
}

/**
 * Update product
 */
function updateProduk($conn) {
    // Validate input
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    $kode_produk = isset($_POST['kode_produk']) ? trim($_POST['kode_produk']) : '';
    $nama_produk = isset($_POST['nama_produk']) ? trim($_POST['nama_produk']) : '';
    $kategori = isset($_POST['kategori']) ? trim($_POST['kategori']) : '';
    $satuan = isset($_POST['satuan']) ? trim($_POST['satuan']) : '';
    $harga = isset($_POST['harga']) ? trim($_POST['harga']) : 0;
    $stok = isset($_POST['stok']) ? trim($_POST['stok']) : 0;
    
    if (!$id || empty($kode_produk) || empty($nama_produk)) {
        sendResponse(false, 'Data tidak lengkap!');
    }
    
    // Check if kode_produk already exists (except current product)
    $checkQuery = "SELECT id FROM produk WHERE kode_produk = :kode_produk AND id != :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':kode_produk', $kode_produk);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendResponse(false, 'Kode produk sudah digunakan!');
    }
    
    // Update data
    $query = "UPDATE produk 
              SET kode_produk = :kode_produk,
                  nama_produk = :nama_produk,
                  kategori = :kategori,
                  satuan = :satuan,
                  harga = :harga,
                  stok = :stok
              WHERE id = :id";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':kode_produk', $kode_produk);
    $stmt->bindParam(':nama_produk', $nama_produk);
    $stmt->bindParam(':kategori', $kategori);
    $stmt->bindParam(':satuan', $satuan);
    $stmt->bindParam(':harga', $harga);
    $stmt->bindParam(':stok', $stok);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        sendResponse(true, 'Produk berhasil diupdate!');
    } else {
        sendResponse(false, 'Gagal mengupdate produk');
    }
}

/**
 * Delete product
 */
function deleteProduk($conn) {
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    
    if (!$id) {
        sendResponse(false, 'ID produk tidak ditemukan');
    }
    
    // Check if product exists
    $checkQuery = "SELECT id FROM produk WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        sendResponse(false, 'Produk tidak ditemukan');
    }
    
    // Delete product
    $query = "DELETE FROM produk WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        sendResponse(true, 'Produk berhasil dihapus!');
    } else {
        sendResponse(false, 'Gagal menghapus produk');
    }
}
?>