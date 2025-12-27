<?php
/**
 * Kriteria API
 * Handle CRUD operations for kriteria (criteria)
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
            getAllKriteria($conn);
            break;
        
        case 'getById':
            getKriteriaById($conn);
            break;
        
        case 'create':
            createKriteria($conn);
            break;
        
        case 'update':
            updateKriteria($conn);
            break;
        
        case 'delete':
            deleteKriteria($conn);
            break;
        
        default:
            sendResponse(false, 'Invalid action');
            break;
    }

} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage());
}

/**
 * Get all kriteria
 */
function getAllKriteria($conn) {
    $query = "SELECT * FROM kriteria ORDER BY kode_kriteria ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(true, 'Data berhasil dimuat', $data);
}

/**
 * Get kriteria by ID
 */
function getKriteriaById($conn) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        sendResponse(false, 'ID kriteria tidak ditemukan');
    }
    
    $query = "SELECT * FROM kriteria WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        sendResponse(true, 'Data berhasil dimuat', $data);
    } else {
        sendResponse(false, 'Kriteria tidak ditemukan');
    }
}

/**
 * Create new kriteria
 */
function createKriteria($conn) {
    // Validate input
    $kode_kriteria = isset($_POST['kode_kriteria']) ? trim($_POST['kode_kriteria']) : '';
    $nama_kriteria = isset($_POST['nama_kriteria']) ? trim($_POST['nama_kriteria']) : '';
    $jenis = isset($_POST['jenis']) ? trim($_POST['jenis']) : '';
    $keterangan = isset($_POST['keterangan']) ? trim($_POST['keterangan']) : null;
    $bobot = 0; // Default bobot 0, akan diatur di menu Bobot
    
    if (empty($kode_kriteria) || empty($nama_kriteria) || empty($jenis)) {
        sendResponse(false, 'Kode kriteria, nama kriteria, dan jenis harus diisi!');
    }
    
    // Validate jenis
    if (!in_array($jenis, ['benefit', 'cost'])) {
        sendResponse(false, 'Jenis kriteria harus benefit atau cost!');
    }
    
    // Check if kode_kriteria already exists
    $checkQuery = "SELECT id FROM kriteria WHERE kode_kriteria = :kode_kriteria";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':kode_kriteria', $kode_kriteria);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendResponse(false, 'Kode kriteria sudah digunakan!');
    }
    
    // Insert data
    $query = "INSERT INTO kriteria (kode_kriteria, nama_kriteria, bobot, jenis, keterangan) 
              VALUES (:kode_kriteria, :nama_kriteria, :bobot, :jenis, :keterangan)";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':kode_kriteria', $kode_kriteria);
    $stmt->bindParam(':nama_kriteria', $nama_kriteria);
    $stmt->bindParam(':bobot', $bobot);
    $stmt->bindParam(':jenis', $jenis);
    $stmt->bindParam(':keterangan', $keterangan);
    
    if ($stmt->execute()) {
        sendResponse(true, 'Kriteria berhasil ditambahkan!');
    } else {
        sendResponse(false, 'Gagal menambahkan kriteria');
    }
}

/**
 * Update kriteria
 */
function updateKriteria($conn) {
    // Validate input
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    $kode_kriteria = isset($_POST['kode_kriteria']) ? trim($_POST['kode_kriteria']) : '';
    $nama_kriteria = isset($_POST['nama_kriteria']) ? trim($_POST['nama_kriteria']) : '';
    $jenis = isset($_POST['jenis']) ? trim($_POST['jenis']) : '';
    $keterangan = isset($_POST['keterangan']) ? trim($_POST['keterangan']) : null;
    
    if (!$id || empty($kode_kriteria) || empty($nama_kriteria) || empty($jenis)) {
        sendResponse(false, 'Data tidak lengkap!');
    }
    
    // Validate jenis
    if (!in_array($jenis, ['benefit', 'cost'])) {
        sendResponse(false, 'Jenis kriteria harus benefit atau cost!');
    }
    
    // Check if kode_kriteria already exists (except current kriteria)
    $checkQuery = "SELECT id FROM kriteria WHERE kode_kriteria = :kode_kriteria AND id != :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':kode_kriteria', $kode_kriteria);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendResponse(false, 'Kode kriteria sudah digunakan!');
    }
    
    // Update data (tidak mengubah bobot)
    $query = "UPDATE kriteria 
              SET kode_kriteria = :kode_kriteria,
                  nama_kriteria = :nama_kriteria,
                  jenis = :jenis,
                  keterangan = :keterangan
              WHERE id = :id";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':kode_kriteria', $kode_kriteria);
    $stmt->bindParam(':nama_kriteria', $nama_kriteria);
    $stmt->bindParam(':jenis', $jenis);
    $stmt->bindParam(':keterangan', $keterangan);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        sendResponse(true, 'Kriteria berhasil diupdate!');
    } else {
        sendResponse(false, 'Gagal mengupdate kriteria');
    }
}

/**
 * Delete kriteria
 */
function deleteKriteria($conn) {
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    
    if (!$id) {
        sendResponse(false, 'ID kriteria tidak ditemukan');
    }
    
    // Check if kriteria exists
    $checkQuery = "SELECT id FROM kriteria WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        sendResponse(false, 'Kriteria tidak ditemukan');
    }
    
    // Check if kriteria is being used in penilaian
    $checkUsageQuery = "SELECT id FROM penilaian WHERE kriteria_id = :id LIMIT 1";
    $checkUsageStmt = $conn->prepare($checkUsageQuery);
    $checkUsageStmt->bindParam(':id', $id);
    $checkUsageStmt->execute();
    
    if ($checkUsageStmt->rowCount() > 0) {
        sendResponse(false, 'Kriteria tidak dapat dihapus karena sudah digunakan dalam penilaian!');
    }
    
    // Delete kriteria
    $query = "DELETE FROM kriteria WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        sendResponse(true, 'Kriteria berhasil dihapus!');
    } else {
        sendResponse(false, 'Gagal menghapus kriteria');
    }
}
?>