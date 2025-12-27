<?php
/**
 * Nilai API
 * Handle CRUD operations for penilaian (assessment values)
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
            getAllNilai($conn);
            break;
        
        case 'getByProduk':
            getNilaiByProduk($conn);
            break;
        
        case 'save':
            saveNilai($conn);
            break;
        
        case 'delete':
            deleteNilai($conn);
            break;
        
        default:
            sendResponse(false, 'Invalid action');
            break;
    }

} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage());
}

/**
 * Get all nilai grouped by product
 */
function getAllNilai($conn) {
    $query = "SELECT 
                p.id as produk_id,
                p.nama_produk,
                MAX(CASE WHEN k.kode_kriteria = 'C1' THEN n.nilai END) as nilai_c1,
                MAX(CASE WHEN k.kode_kriteria = 'C2' THEN n.nilai END) as nilai_c2,
                MAX(CASE WHEN k.kode_kriteria = 'C3' THEN n.nilai END) as nilai_c3,
                MAX(CASE WHEN k.kode_kriteria = 'C4' THEN n.nilai END) as nilai_c4,
                MAX(CASE WHEN k.kode_kriteria = 'C5' THEN n.nilai END) as nilai_c5
              FROM produk p
              LEFT JOIN penilaian n ON p.id = n.produk_id
              LEFT JOIN kriteria k ON n.kriteria_id = k.id
              GROUP BY p.id, p.nama_produk
              HAVING nilai_c1 IS NOT NULL
              ORDER BY p.nama_produk";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(true, 'Data berhasil dimuat', $data);
}

/**
 * Get nilai by product ID
 */
function getNilaiByProduk($conn) {
    $produk_id = isset($_GET['produk_id']) ? $_GET['produk_id'] : null;
    
    if (!$produk_id) {
        sendResponse(false, 'ID produk tidak ditemukan');
    }
    
    $query = "SELECT 
                n.id,
                n.produk_id,
                n.kriteria_id,
                n.nilai,
                k.kode_kriteria,
                k.nama_kriteria
              FROM penilaian n
              JOIN kriteria k ON n.kriteria_id = k.id
              WHERE n.produk_id = :produk_id
              ORDER BY k.kode_kriteria";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':produk_id', $produk_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(true, 'Data berhasil dimuat', $data);
    } else {
        sendResponse(false, 'Data nilai tidak ditemukan');
    }
}

/**
 * Save nilai (insert or update)
 */
function saveNilai($conn) {
    $produk_id = isset($_POST['produk_id']) ? trim($_POST['produk_id']) : '';
    $nilai_data = isset($_POST['nilai_data']) ? $_POST['nilai_data'] : '';
    
    if (empty($produk_id) || empty($nilai_data)) {
        sendResponse(false, 'Data tidak lengkap!');
    }
    
    // Parse JSON data
    $nilai_array = json_decode($nilai_data, true);
    
    if (!$nilai_array) {
        sendResponse(false, 'Format data nilai tidak valid!');
    }
    
    // Check if product exists
    $checkProduk = "SELECT id FROM produk WHERE id = :produk_id";
    $checkStmt = $conn->prepare($checkProduk);
    $checkStmt->bindParam(':produk_id', $produk_id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        sendResponse(false, 'Produk tidak ditemukan!');
    }
    
    // Begin transaction
    $conn->beginTransaction();
    
    try {
        // Delete existing values for this product
        $deleteQuery = "DELETE FROM penilaian WHERE produk_id = :produk_id";
        $deleteStmt = $conn->prepare($deleteQuery);
        $deleteStmt->bindParam(':produk_id', $produk_id);
        $deleteStmt->execute();
        
        // Insert new values
        $insertQuery = "INSERT INTO penilaian (produk_id, kriteria_id, nilai) 
                       VALUES (:produk_id, :kriteria_id, :nilai)";
        $insertStmt = $conn->prepare($insertQuery);
        
        foreach ($nilai_array as $item) {
            $kriteria_id = $item['kriteria_id'];
            $nilai = $item['nilai'];
            
            $insertStmt->bindParam(':produk_id', $produk_id);
            $insertStmt->bindParam(':kriteria_id', $kriteria_id);
            $insertStmt->bindParam(':nilai', $nilai);
            $insertStmt->execute();
        }
        
        // Commit transaction
        $conn->commit();
        sendResponse(true, 'Nilai berhasil disimpan!');
        
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollBack();
        sendResponse(false, 'Gagal menyimpan nilai: ' . $e->getMessage());
    }
}

/**
 * Delete nilai by product ID
 */
function deleteNilai($conn) {
    $produk_id = isset($_POST['produk_id']) ? $_POST['produk_id'] : null;
    
    if (!$produk_id) {
        sendResponse(false, 'ID produk tidak ditemukan');
    }
    
    // Check if nilai exists
    $checkQuery = "SELECT id FROM penilaian WHERE produk_id = :produk_id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':produk_id', $produk_id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        sendResponse(false, 'Data nilai tidak ditemukan');
    }
    
    // Delete nilai
    $query = "DELETE FROM penilaian WHERE produk_id = :produk_id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':produk_id', $produk_id);
    
    if ($stmt->execute()) {
        sendResponse(true, 'Nilai berhasil dihapus!');
    } else {
        sendResponse(false, 'Gagal menghapus nilai');
    }
}
?>