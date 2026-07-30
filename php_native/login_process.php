<?php
session_start();
require_once 'config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['username'] = $user['username'];

        // Get specific profile data
        if ($user['role'] == 'admin') {
            $stmt = $pdo->prepare("SELECT * FROM admin WHERE user_id = :user_id");
            $stmt->execute(['user_id' => $user['id']]);
            $_SESSION['profile'] = $stmt->fetch();
            header("Location: admin/index.php");
        } else if ($user['role'] == 'dosen') {
            $stmt = $pdo->prepare("SELECT * FROM dosen WHERE user_id = :user_id");
            $stmt->execute(['user_id' => $user['id']]);
            $_SESSION['profile'] = $stmt->fetch();
            header("Location: dosen/index.php");
        } else if ($user['role'] == 'mahasiswa') {
            $stmt = $pdo->prepare("SELECT * FROM mahasiswa WHERE user_id = :user_id");
            $stmt->execute(['user_id' => $user['id']]);
            $_SESSION['profile'] = $stmt->fetch();
            header("Location: mahasiswa/index.php");
        }
        exit;
    } else {
        $_SESSION['error'] = "Username atau password salah!";
        header("Location: index.php");
        exit;
    }
}
?>
