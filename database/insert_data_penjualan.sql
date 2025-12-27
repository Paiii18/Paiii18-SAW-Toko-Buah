-- Insert Data Penjualan untuk November 2025
-- Data ini sesuai dengan screenshot yang diberikan

-- ========================================
-- 1. INSERT DATA PRODUK
-- ========================================

INSERT INTO `produk` (`id`, `kode_produk`, `nama_produk`, `kategori`, `satuan`, `keterangan`) VALUES
(1, 'P001', 'Mangga Harum Manis', 'Lokal', 'Kg', 'Mangga kualitas premium'),
(2, 'P002', 'Jeruk Medan', 'Lokal', 'Kg', 'Jeruk segar dari Medan'),
(3, 'P003', 'Apel Malang', 'Lokal', 'Kg', 'Apel dari Malang'),
(4, 'P004', 'Pisang Cavendish', 'Import', 'Kg', 'Pisang Cavendish berkualitas'),
(5, 'P005', 'Semangka Merah', 'Lokal', 'Buah', 'Semangka merah manis'),
(6, 'P006', 'Anggur Merah', 'Import', 'Kg', 'Anggur merah segar'),
(7, 'P007', 'Pepaya California', 'Import', 'Buah', 'Pepaya California');

-- ========================================
-- 2. INSERT DATA PENILAIAN - NOVEMBER 2025
-- ========================================

-- Mangga Harum Manis
-- C1: Volume Penjualan = 450 unit
-- C2: Pendapatan = Rp 15.750.000
INSERT INTO `penilaian` (`produk_id`, `kriteria_id`, `nilai`) VALUES
(1, 1, 450),
(1, 2, 15750000);

-- Jeruk Medan
-- C1: Volume Penjualan = 380 unit
-- C2: Pendapatan = Rp 10.640.000
INSERT INTO `penilaian` (`produk_id`, `kriteria_id`, `nilai`) VALUES
(2, 1, 380),
(2, 2, 10640000);

-- Apel Malang
-- C1: Volume Penjualan = 290 unit
-- C2: Pendapatan = Rp 13.050.000
INSERT INTO `penilaian` (`produk_id`, `kriteria_id`, `nilai`) VALUES
(3, 1, 290),
(3, 2, 13050000);

-- Pisang Cavendish
-- C1: Volume Penjualan = 620 unit
-- C2: Pendapatan = Rp 11.160.000
INSERT INTO `penilaian` (`produk_id`, `kriteria_id`, `nilai`) VALUES
(4, 1, 620),
(4, 2, 11160000);

-- Semangka Merah
-- C1: Volume Penjualan = 180 unit
-- C2: Pendapatan = Rp 4.500.000
INSERT INTO `penilaian` (`produk_id`, `kriteria_id`, `nilai`) VALUES
(5, 1, 180),
(5, 2, 4500000);

-- Anggur Merah
-- C1: Volume Penjualan = 95 unit
-- C2: Pendapatan = Rp 8.075.000
INSERT INTO `penilaian` (`produk_id`, `kriteria_id`, `nilai`) VALUES
(6, 1, 95),
(6, 2, 8075000);

-- Pepaya California
-- C1: Volume Penjualan = 320 unit
-- C2: Pendapatan = Rp 7.040.000
INSERT INTO `penilaian` (`produk_id`, `kriteria_id`, `nilai`) VALUES
(7, 1, 320),
(7, 2, 7040000);

-- ========================================
-- CATATAN:
-- ========================================
-- Data ini hanya mengisi kriteria C1 (Volume Penjualan) dan C2 (Pendapatan)
-- Untuk kriteria lainnya (C3, C4, C5) dapat ditambahkan sesuai kebutuhan
-- Periode: November 2025
