-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 10, 2025 at 03:01 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spk_buah`
--

-- --------------------------------------------------------

--
-- Table structure for table `hasil_saw`
--

CREATE TABLE `hasil_saw` (
  `id` int NOT NULL,
  `produk_id` int NOT NULL,
  `nilai_preferensi` decimal(10,4) NOT NULL,
  `ranking` int NOT NULL,
  `periode` varchar(20) DEFAULT NULL,
  `tanggal_hitung` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kriteria`
--

CREATE TABLE `kriteria` (
  `id` int NOT NULL,
  `kode_kriteria` varchar(10) NOT NULL,
  `nama_kriteria` varchar(100) NOT NULL,
  `bobot` decimal(5,2) NOT NULL,
  `jenis` enum('benefit','cost') NOT NULL,
  `keterangan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kriteria`
--

INSERT INTO `kriteria` (`id`, `kode_kriteria`, `nama_kriteria`, `bobot`, `jenis`, `keterangan`, `created_at`, `updated_at`) VALUES
(1, 'C1', 'Volume Penjualan', 0.30, 'benefit', 'Total unit terjual per bulan', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(2, 'C2', 'Pendapatan', 0.25, 'benefit', 'Total pendapatan per bulan', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(3, 'C3', 'Margin Keuntungan', 0.20, 'benefit', 'Persentase keuntungan', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(4, 'C4', 'Stok Tersedia', 0.15, 'benefit', 'Ketersediaan stok', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(5, 'C5', 'Tingkat Kerusakan', 0.10, 'cost', 'Persentase produk rusak', '2025-12-10 02:11:31', '2025-12-10 02:11:31');

-- --------------------------------------------------------

--
-- Table structure for table `penilaian`
--

CREATE TABLE `penilaian` (
  `id` int NOT NULL,
  `produk_id` int NOT NULL,
  `kriteria_id` int NOT NULL,
  `nilai` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `penilaian`
--

INSERT INTO `penilaian` (`id`, `produk_id`, `kriteria_id`, `nilai`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 450.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(2, 1, 2, 15750000.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(3, 2, 1, 380.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(4, 2, 2, 10640000.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(5, 3, 1, 290.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(6, 3, 2, 13050000.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(7, 4, 1, 620.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(8, 4, 2, 11160000.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(9, 5, 1, 180.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(10, 5, 2, 4500000.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(11, 6, 1, 95.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(12, 6, 2, 8075000.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(13, 7, 1, 320.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(14, 7, 2, 7040000.00, '2025-12-10 02:11:31', '2025-12-10 02:11:31');

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `id` int NOT NULL,
  `kode_produk` varchar(20) NOT NULL,
  `nama_produk` varchar(100) NOT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `satuan` varchar(20) DEFAULT NULL,
  `keterangan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `produk`
--

INSERT INTO `produk` (`id`, `kode_produk`, `nama_produk`, `kategori`, `satuan`, `keterangan`, `created_at`, `updated_at`) VALUES
(1, 'P001', 'Mangga Harum Manis', 'Lokal', 'Kg', 'Mangga kualitas premium', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(2, 'P002', 'Jeruk Medan', 'Lokal', 'Kg', 'Jeruk segar dari Medan', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(3, 'P003', 'Apel Malang', 'Lokal', 'Kg', 'Apel dari Malang', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(4, 'P004', 'Pisang Cavendish', 'Import', 'Kg', 'Pisang Cavendish berkualitas', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(5, 'P005', 'Semangka Merah', 'Lokal', 'Buah', 'Semangka merah manis', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(6, 'P006', 'Anggur Merah', 'Import', 'Kg', 'Anggur merah segar', '2025-12-10 02:11:31', '2025-12-10 02:11:31'),
(7, 'P007', 'Pepaya California', 'Import', 'Buah', 'Pepaya California', '2025-12-10 02:11:31', '2025-12-10 02:11:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `role` enum('admin','user') DEFAULT 'admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `nama_lengkap`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin', '2025-12-10 02:11:31', '2025-12-10 02:11:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `hasil_saw`
--
ALTER TABLE `hasil_saw`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produk_id` (`produk_id`);

--
-- Indexes for table `kriteria`
--
ALTER TABLE `kriteria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_kriteria` (`kode_kriteria`);

--
-- Indexes for table `penilaian`
--
ALTER TABLE `penilaian`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_penilaian` (`produk_id`,`kriteria_id`),
  ADD KEY `kriteria_id` (`kriteria_id`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_produk` (`kode_produk`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `hasil_saw`
--
ALTER TABLE `hasil_saw`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kriteria`
--
ALTER TABLE `kriteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `penilaian`
--
ALTER TABLE `penilaian`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `hasil_saw`
--
ALTER TABLE `hasil_saw`
  ADD CONSTRAINT `hasil_saw_ibfk_1` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `penilaian`
--
ALTER TABLE `penilaian`
  ADD CONSTRAINT `penilaian_ibfk_1` FOREIGN KEY (`produk_id`) REFERENCES `produk` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `penilaian_ibfk_2` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
