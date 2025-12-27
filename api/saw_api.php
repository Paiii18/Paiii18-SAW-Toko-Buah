<?php
/**
 * SAW API
 * Handle SAW (Simple Additive Weighting) calculation
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once 'config.php';

$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

try {
    $database = new Database();
    $conn = $database->getConnection();

    switch ($action) {
        case 'getData':
            getData($conn);
            break;

        case 'calculate':
            calculateSAW($conn);
            break;

        case 'getHistory':
            getHistory($conn);
            break;

        default:
            sendResponse(false, 'Invalid action');
            break;
    }

} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage());
}

/**
 * Get all data needed for SAW calculation
 */
function getData($conn) {
    // Get kriteria
    $kriteriaQuery = "SELECT * FROM kriteria ORDER BY kode_kriteria";
    $kriteriaStmt = $conn->prepare($kriteriaQuery);
    $kriteriaStmt->execute();
    $kriteria = $kriteriaStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get produk with latest penjualan data including margin and kerusakan
    $produkQuery = "SELECT
                        p.id,
                        p.kode_produk,
                        p.nama_produk,
                        p.stok,
                        p.harga,
                        COALESCE(dp.kuantitas, 0) as kuantitas,
                        COALESCE(dp.pendapatan, 0) as pendapatan,
                        COALESCE(dp.margin, 0) as margin,
                        COALESCE(dp.kerusakan, 0) as kerusakan
                    FROM produk p
                    LEFT JOIN (
                        SELECT produk_id, kuantitas, pendapatan, margin, kerusakan
                        FROM data_penjualan
                        WHERE id IN (
                            SELECT MAX(id) FROM data_penjualan GROUP BY produk_id
                        )
                    ) dp ON p.id = dp.produk_id
                    ORDER BY p.nama_produk";

    $produkStmt = $conn->prepare($produkQuery);
    $produkStmt->execute();
    $produk = $produkStmt->fetchAll(PDO::FETCH_ASSOC);

    // Build matrix data
    $matrixData = [];
    foreach ($produk as $p) {
        $row = [
            'id' => $p['id'],
            'kode_produk' => $p['kode_produk'],
            'nama_produk' => $p['nama_produk'],
            'nilai' => []
        ];

        // Map kriteria values
        foreach ($kriteria as $k) {
            $nilai = 0;
            switch ($k['kode_kriteria']) {
                case 'C1': // Volume Penjualan
                    $nilai = floatval($p['kuantitas']);
                    break;
                case 'C2': // Pendapatan
                    $nilai = floatval($p['pendapatan']);
                    break;
                case 'C3': // Margin Keuntungan
                    $nilai = floatval($p['margin']);
                    break;
                case 'C4': // Stok Tersedia
                    $nilai = floatval($p['stok']);
                    break;
                case 'C5': // Tingkat Kerusakan
                    $nilai = floatval($p['kerusakan']);
                    break;
            }
            $row['nilai'][$k['kode_kriteria']] = $nilai;
        }

        $matrixData[] = $row;
    }

    sendResponse(true, 'Data berhasil dimuat', [
        'kriteria' => $kriteria,
        'produk' => $produk,
        'matrix' => $matrixData
    ]);
}

/**
 * Calculate SAW and save results
 */
function calculateSAW($conn) {
    $periode = isset($_POST['periode']) ? $_POST['periode'] : date('Y-m');

    // Get kriteria
    $kriteriaQuery = "SELECT * FROM kriteria ORDER BY kode_kriteria";
    $kriteriaStmt = $conn->prepare($kriteriaQuery);
    $kriteriaStmt->execute();
    $kriteria = $kriteriaStmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($kriteria) === 0) {
        sendResponse(false, 'Tidak ada data kriteria');
    }

    // Get produk with data penjualan including margin and kerusakan
    $produkQuery = "SELECT
                        p.id,
                        p.kode_produk,
                        p.nama_produk,
                        p.stok,
                        p.harga,
                        COALESCE(dp.kuantitas, 0) as kuantitas,
                        COALESCE(dp.pendapatan, 0) as pendapatan,
                        COALESCE(dp.margin, 0) as margin,
                        COALESCE(dp.kerusakan, 0) as kerusakan
                    FROM produk p
                    LEFT JOIN (
                        SELECT produk_id, kuantitas, pendapatan, margin, kerusakan
                        FROM data_penjualan
                        WHERE id IN (
                            SELECT MAX(id) FROM data_penjualan GROUP BY produk_id
                        )
                    ) dp ON p.id = dp.produk_id
                    ORDER BY p.nama_produk";

    $produkStmt = $conn->prepare($produkQuery);
    $produkStmt->execute();
    $produk = $produkStmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($produk) === 0) {
        sendResponse(false, 'Tidak ada data produk');
    }

    // Build decision matrix
    $matrix = [];
    foreach ($produk as $p) {
        $row = ['id' => $p['id'], 'nama' => $p['nama_produk'], 'nilai' => []];

        foreach ($kriteria as $k) {
            $nilai = 0;
            switch ($k['kode_kriteria']) {
                case 'C1': // Volume Penjualan
                    $nilai = floatval($p['kuantitas']);
                    break;
                case 'C2': // Pendapatan
                    $nilai = floatval($p['pendapatan']);
                    break;
                case 'C3': // Margin Keuntungan (dari input)
                    $nilai = floatval($p['margin']);
                    break;
                case 'C4': // Stok Tersedia
                    $nilai = floatval($p['stok']);
                    break;
                case 'C5': // Tingkat Kerusakan (dari input)
                    $nilai = floatval($p['kerusakan']);
                    break;
            }
            $row['nilai'][$k['kode_kriteria']] = $nilai;
        }
        $matrix[] = $row;
    }

    // Find max and min for each kriteria
    $maxMin = [];
    foreach ($kriteria as $k) {
        $kode = $k['kode_kriteria'];
        $values = [];
        foreach ($matrix as $row) {
            $values[] = $row['nilai'][$kode];
        }
        $maxMin[$kode] = [
            'max' => count($values) > 0 && max($values) > 0 ? max($values) : 1,
            'min' => count($values) > 0 && min($values) > 0 ? min($values) : 1
        ];
    }

    // Normalize matrix
    $normalized = [];
    foreach ($matrix as $row) {
        $normRow = ['id' => $row['id'], 'nama' => $row['nama'], 'nilai' => []];

        foreach ($kriteria as $k) {
            $kode = $k['kode_kriteria'];
            $nilai = $row['nilai'][$kode];

            if ($k['jenis'] === 'benefit') {
                // Benefit: nilai / max
                $normRow['nilai'][$kode] = $maxMin[$kode]['max'] > 0 ? $nilai / $maxMin[$kode]['max'] : 0;
            } else {
                // Cost: min / nilai
                $normRow['nilai'][$kode] = $nilai > 0 ? $maxMin[$kode]['min'] / $nilai : 0;
            }
        }
        $normalized[] = $normRow;
    }

    // Calculate weighted sum (preference value)
    $results = [];
    foreach ($normalized as $row) {
        $preferensi = 0;
        $weightedValues = [];

        foreach ($kriteria as $k) {
            $kode = $k['kode_kriteria'];
            $bobot = floatval($k['bobot']);
            $weighted = $row['nilai'][$kode] * $bobot;
            $weightedValues[$kode] = $weighted;
            $preferensi += $weighted;
        }

        $results[] = [
            'id' => $row['id'],
            'nama' => $row['nama'],
            'normalized' => $row['nilai'],
            'weighted' => $weightedValues,
            'preferensi' => round($preferensi, 4)
        ];
    }

    // Sort by preferensi (descending)
    usort($results, function($a, $b) {
        return $b['preferensi'] <=> $a['preferensi'];
    });

    // Add ranking
    $rank = 1;
    foreach ($results as &$r) {
        $r['ranking'] = $rank++;
    }
    unset($r); // PENTING: hapus reference untuk menghindari bug PHP

    // Save to database
    $conn->beginTransaction();
    try {
        // Delete old results for same periode
        $deleteQuery = "DELETE FROM hasil_saw WHERE periode = :periode";
        $deleteStmt = $conn->prepare($deleteQuery);
        $deleteStmt->bindParam(':periode', $periode);
        $deleteStmt->execute();

        // Insert new results
        $insertQuery = "INSERT INTO hasil_saw (produk_id, nilai_preferensi, ranking, periode)
                        VALUES (:produk_id, :nilai_preferensi, :ranking, :periode)";
        $insertStmt = $conn->prepare($insertQuery);

        foreach ($results as $r) {
            $insertStmt->bindParam(':produk_id', $r['id']);
            $insertStmt->bindParam(':nilai_preferensi', $r['preferensi']);
            $insertStmt->bindParam(':ranking', $r['ranking']);
            $insertStmt->bindParam(':periode', $periode);
            $insertStmt->execute();
        }

        $conn->commit();

        sendResponse(true, 'Perhitungan SAW berhasil', [
            'kriteria' => $kriteria,
            'matrix' => $matrix,
            'maxMin' => $maxMin,
            'normalized' => $normalized,
            'results' => $results,
            'periode' => $periode
        ]);

    } catch (Exception $e) {
        $conn->rollBack();
        sendResponse(false, 'Gagal menyimpan hasil: ' . $e->getMessage());
    }
}

/**
 * Get calculation history
 */
function getHistory($conn) {
    $query = "SELECT
                hs.id,
                hs.produk_id,
                p.nama_produk,
                hs.nilai_preferensi,
                hs.ranking,
                hs.periode,
                hs.tanggal_hitung
              FROM hasil_saw hs
              JOIN produk p ON hs.produk_id = p.id
              ORDER BY hs.periode DESC, hs.ranking ASC";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group by periode
    $grouped = [];
    foreach ($data as $row) {
        $periode = $row['periode'];
        if (!isset($grouped[$periode])) {
            $grouped[$periode] = [];
        }
        $grouped[$periode][] = $row;
    }

    sendResponse(true, 'Data berhasil dimuat', $grouped);
}
?>
