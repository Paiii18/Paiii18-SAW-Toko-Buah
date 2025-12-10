<?php
/**
 * Login API
 * Handle user authentication
 */

// Set JSON header first
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display, we'll log them

require_once 'config.php';

// Only accept POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed',
        'data' => null
    ]);
    exit;
}

// Get input data
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

// LOG: Input data
error_log("=== LOGIN ATTEMPT ===");
error_log("Username input: " . $username);
error_log("Password length: " . strlen($password));

// Validate input
if (empty($username) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Username dan password harus diisi!',
        'data' => null
    ]);
    exit;
}

try {
    // Database connection
    $database = new Database();
    $conn = $database->getConnection();
    
    // LOG: Connection success
    error_log("Database connected successfully");

    // Query user
    $query = "SELECT id, username, password, nama_lengkap, role 
              FROM users 
              WHERE username = :username 
              LIMIT 1";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    
    // LOG: Query executed
    error_log("Query executed, rows found: " . $stmt->rowCount());

    // Check if user exists
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // LOG: User found
        error_log("User found: " . $user['username']);
        error_log("Stored password hash: " . substr($user['password'], 0, 20) . "...");
        error_log("Password verify attempt...");

        // Verify password
        $isPasswordCorrect = password_verify($password, $user['password']);
        error_log("Password verify result: " . ($isPasswordCorrect ? 'TRUE' : 'FALSE'));
        
        if ($isPasswordCorrect) {
            // Set session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['nama_lengkap'] = $user['nama_lengkap'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['is_logged_in'] = true;

            // Prepare response data (without password)
            $userData = [
                'id' => $user['id'],
                'username' => $user['username'],
                'nama_lengkap' => $user['nama_lengkap'],
                'role' => $user['role']
            ];
            
            error_log("LOGIN SUCCESS for user: " . $user['username']);

            echo json_encode([
                'success' => true,
                'message' => 'Login berhasil!',
                'data' => $userData
            ]);
            exit;
        } else {
            error_log("LOGIN FAILED: Password incorrect");
            
            echo json_encode([
                'success' => false,
                'message' => 'Password salah!',
                'data' => null,
                'debug' => [
                    'password_length' => strlen($password),
                    'hash_preview' => substr($user['password'], 0, 20) . '...'
                ]
            ]);
            exit;
        }
    } else {
        error_log("LOGIN FAILED: Username not found");
        
        echo json_encode([
            'success' => false,
            'message' => 'Username tidak ditemukan!',
            'data' => null
        ]);
        exit;
    }

} catch (PDOException $e) {
    error_log("DATABASE ERROR: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage(),
        'data' => null
    ]);
    exit;
}
?>