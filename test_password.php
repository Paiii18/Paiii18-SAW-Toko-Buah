<?php
require_once 'api/config.php';

echo "<h2>Password Debug Test</h2>";

// Test password verify langsung
$password = 'admin123';
$hash = '$2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yktzoK41xy';

echo "<strong>Test 1: Direct password_verify</strong><br>";
echo "Password: " . $password . "<br>";
echo "Hash: " . $hash . "<br>";
$result = password_verify($password, $hash);
echo "Result: " . ($result ? '<span style="color:green">✓ MATCH</span>' : '<span style="color:red">✗ NOT MATCH</span>') . "<br><br>";

// Test dari database
echo "<strong>Test 2: Check database</strong><br>";
try {
    $database = new Database();
    $conn = $database->getConnection();
    
    $query = "SELECT username, password FROM users WHERE username = 'admin'";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "Username: " . $user['username'] . "<br>";
        echo "Hash from DB: " . $user['password'] . "<br>";
        echo "Hash length: " . strlen($user['password']) . "<br>";
        
        $dbResult = password_verify($password, $user['password']);
        echo "Verify result: " . ($dbResult ? '<span style="color:green">✓ MATCH</span>' : '<span style="color:red">✗ NOT MATCH</span>') . "<br><br>";
        
        // Cek karakter tersembunyi
        echo "<strong>Test 3: Check for hidden characters</strong><br>";
        echo "Raw bytes: " . bin2hex(substr($user['password'], 0, 10)) . "<br>";
        
    } else {
        echo "<span style='color:red'>User not found!</span><br>";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}

// Generate new hash
echo "<br><strong>Test 4: Generate fresh hash</strong><br>";
$newHash = password_hash('admin123', PASSWORD_DEFAULT);
echo "New hash: " . $newHash . "<br>";
echo "Verify new hash: " . (password_verify('admin123', $newHash) ? '<span style="color:green">✓ MATCH</span>' : '<span style="color:red">✗ NOT MATCH</span>') . "<br>";
echo "<br>SQL to update:<br>";
echo "<code>UPDATE users SET password = '$newHash' WHERE username = 'admin';</code>";
?>