<?php
require_once '../includes/header.php';
require_once '../config/database.php';

if ($_SESSION['role'] !== 'mahasiswa') {
    header("Location: ../index.php");
    exit;
}

$mahasiswa_id = $_SESSION['profile']['id'];

// Get IPK (Calculate)
$grades = $pdo->query("SELECT bobot, c.sks FROM grades g JOIN courses c ON g.course_id = c.id WHERE g.mahasiswa_id = $mahasiswa_id")->fetchAll();
$total_sks = 0;
$total_bobot_sks = 0;

foreach($grades as $g) {
    $total_sks += $g['sks'];
    $total_bobot_sks += ($g['bobot'] * $g['sks']);
}

$ipk = $total_sks > 0 ? number_format($total_bobot_sks / $total_sks, 2) : '0.00';
?>

<!-- Content Header (Page header) -->
<section class="content-header">
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-sm-6">
        <h1>Dashboard Mahasiswa</h1>
      </div>
    </div>
  </div>
</section>

<!-- Main content -->
<section class="content">
  <div class="container-fluid">
    <div class="row">
      <div class="col-lg-4 col-6">
        <div class="small-box bg-primary">
          <div class="inner">
            <h3><?= $ipk ?></h3>
            <p>IPK Saat Ini</p>
          </div>
          <div class="icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4 col-6">
        <div class="small-box bg-success">
          <div class="inner">
            <h3><?= $total_sks ?></h3>
            <p>Total SKS Diambil</p>
          </div>
          <div class="icon">
            <i class="fas fa-book"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require_once '../includes/footer.php'; ?>
