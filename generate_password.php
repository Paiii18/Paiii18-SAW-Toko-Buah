<?php
// Generate password hash untuk admin123
$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "Password: " . $password . "<br>";
echo "Hash: " . $hash . "<br><br>";

echo "Copy SQL command ini:<br>";
echo "<code>UPDATE users SET password = '$hash' WHERE username = 'admin';</code>";
?>