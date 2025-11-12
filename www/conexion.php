<?php
$host = "localhost";  
$user = "usuario";
$pass = "contrasena";
$dbname = "login";
$port = 3307;         // Puerto nuevo

$conn = new mysqli($host, $user, $pass, $dbname, $port);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>