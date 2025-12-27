<?php
/**
 * Nilai API
 * Handle CRUD operations for data penjualan (sales data)
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

        case 'getById':
            getNilaiById($conn);
            break;

        case 'create':
            createNilai($conn);
            break;

        case 'update':
            updateNilai($conn);
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
 * Get all data penjualan
 */
function getAllNilai($conn) {
    $query = "SELECT
                dp.id,
                dp.produk_id,
                p.nama_produk,
                dp.bulan,
                dp.tahun,
                dp.kuantitas,
                dp.pendapatan,
                dp.margin,
                dp.kerusakan,
                dp.created_at
              FROM data_penjualan dp
              JOIN produk p ON dp.produk_id = p.id
              ORDER BY dp.tahun DESC,
                       FIELD(dp.bulan, 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                             'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember') DESC,
                       dp.created_at DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(true, 'Data berhasil dimuat', $data);
}

/**
 * Get data penjualan by ID
 */
function getNilaiById($conn) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;

    if (!$id) {
        sendResponse(false, 'ID tidak ditemukan');
    }

    // Get data penjualan
    $query = "SELECT
                dp.id,
                dp.produk_id,
                p.nama_produk,
                dp.bulan,
                dp.tahun,
                dp.kuantitas,
                dp.pendapatan,
                dp.margin,
                dp.kerusakan
              FROM data_penjualan dp
              JOIN produk p ON dp.produk_id = p.id
              WHERE dp.id = :id";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        sendResponse(true, 'Data berhasil dimuat', $data);
    } else {
        sendResponse(false, 'Data penjualan tidak ditemukan');
    }
}

/**
 * Create new data penjualan
 */
function createNilai($conn) {
    $produk_id = isset($_POST['produk_id']) ? trim($_POST['produk_id']) : '';
    $bulan = isset($_POST['bulan']) ? trim($_POST['bulan']) : '';
    $tahun = isset($_POST['tahun']) ? trim($_POST['tahun']) : '';
    $kuantitas = isset($_POST['kuantitas']) ? trim($_POST['kuantitas']) : 0;
    $pendapatan = isset($_POST['pendapatan']) ? trim($_POST['pendapatan']) : 0;
    $margin = isset($_POST['margin']) ? trim($_POST['margin']) : 0;
    $kerusakan = isset($_POST['kerusakan']) ? trim($_POST['kerusakan']) : 0;

    if (empty($produk_id) || empty($bulan) || empty($tahun)) {
        sendResponse(false, 'Data tidak lengkap!');
    }

    // Check if product exists
    $checkProduk = "SELECT id FROM produk WHERE id = :produk_id";
    $checkStmt = $conn->prepare($checkProduk);
    $checkStmt->bindParam(':produk_id', $produk_id);
    $checkStmt->execute();

    if ($checkStmt->rowCount() === 0) {
        sendResponse(false, 'Produk tidak ditemukan!');
    }

    try {
        // Insert data penjualan
        $insertDP = "INSERT INTO data_penjualan (produk_id, bulan, tahun, kuantitas, pendapatan, margin, kerusakan)
                     VALUES (:produk_id, :bulan, :tahun, :kuantitas, :pendapatan, :margin, :kerusakan)";

        $stmtDP = $conn->prepare($insertDP);
        $stmtDP->bindParam(':produk_id', $produk_id);
        $stmtDP->bindParam(':bulan', $bulan);
        $stmtDP->bindParam(':tahun', $tahun);
        $stmtDP->bindParam(':kuantitas', $kuantitas);
        $stmtDP->bindParam(':pendapatan', $pendapatan);
        $stmtDP->bindParam(':margin', $margin);
        $stmtDP->bindParam(':kerusakan', $kerusakan);
        $stmtDP->execute();

        sendResponse(true, 'Data penjualan berhasil ditambahkan!');

    } catch (Exception $e) {
        sendResponse(false, 'Gagal menyimpan data: ' . $e->getMessage());
    }
}

/**
 * Update data penjualan
 */
function updateNilai($conn) {
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    $produk_id = isset($_POST['produk_id']) ? trim($_POST['produk_id']) : '';
    $bulan = isset($_POST['bulan']) ? trim($_POST['bulan']) : '';
    $tahun = isset($_POST['tahun']) ? trim($_POST['tahun']) : '';
    $kuantitas = isset($_POST['kuantitas']) ? trim($_POST['kuantitas']) : 0;
    $pendapatan = isset($_POST['pendapatan']) ? trim($_POST['pendapatan']) : 0;
    $margin = isset($_POST['margin']) ? trim($_POST['margin']) : 0;
    $kerusakan = isset($_POST['kerusakan']) ? trim($_POST['kerusakan']) : 0;

    if (!$id || empty($produk_id) || empty($bulan) || empty($tahun)) {
        sendResponse(false, 'Data tidak lengkap!');
    }

    try {
        // Update data penjualan
        $updateDP = "UPDATE data_penjualan
                     SET produk_id = :produk_id,
                         bulan = :bulan,
                         tahun = :tahun,
                         kuantitas = :kuantitas,
                         pendapatan = :pendapatan,
                         margin = :margin,
                         kerusakan = :kerusakan
                     WHERE id = :id";

        $stmtDP = $conn->prepare($updateDP);
        $stmtDP->bindParam(':produk_id', $produk_id);
        $stmtDP->bindParam(':bulan', $bulan);
        $stmtDP->bindParam(':tahun', $tahun);
        $stmtDP->bindParam(':kuantitas', $kuantitas);
        $stmtDP->bindParam(':pendapatan', $pendapatan);
        $stmtDP->bindParam(':margin', $margin);
        $stmtDP->bindParam(':kerusakan', $kerusakan);
        $stmtDP->bindParam(':id', $id);
        $stmtDP->execute();

        sendResponse(true, 'Data penjualan berhasil diupdate!');

    } catch (Exception $e) {
        sendResponse(false, 'Gagal mengupdate data: ' . $e->getMessage());
    }
}

/**
 * Delete data penjualan
 */
function deleteNilai($conn) {
    $id = isset($_POST['id']) ? $_POST['id'] : null;

    if (!$id) {
        sendResponse(false, 'ID tidak ditemukan');
    }

    // Check if data exists
    $checkQuery = "SELECT produk_id FROM data_penjualan WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id);
    $checkStmt->execute();

    if ($checkStmt->rowCount() === 0) {
        sendResponse(false, 'Data penjualan tidak ditemukan');
    }

    // Delete data penjualan
    $query = "DELETE FROM data_penjualan WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
        sendResponse(true, 'Data penjualan berhasil dihapus!');
    } else {
        sendResponse(false, 'Gagal menghapus data');
    }
}
?>
