<?php
require_once '../includes/header.php';
require_once '../config/database.php';

if ($_SESSION['role'] !== 'admin') {
    header("Location: ../index.php");
    exit;
}

$dosen = $pdo->query("SELECT d.*, u.username FROM dosen d JOIN users u ON d.user_id = u.id")->fetchAll();
?>

<section class="content-header">
  <div class="container-fluid">
    <h1>Data Dosen</h1>
  </div>
</section>

<section class="content">
  <div class="container-fluid">
    <div class="card">
      <div class="card-body">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>NIDN</th>
              <th>Nama</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach($dosen as $d): ?>
            <tr>
              <td><?= htmlspecialchars($d['nidn']) ?></td>
              <td><?= htmlspecialchars($d['nama']) ?></td>
              <td><?= htmlspecialchars($d['username']) ?></td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<?php require_once '../includes/footer.php'; ?>
