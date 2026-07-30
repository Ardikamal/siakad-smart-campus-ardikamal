<?php
require_once '../includes/header.php';
require_once '../config/database.php';

if ($_SESSION['role'] !== 'admin') {
    header("Location: ../index.php");
    exit;
}

$mahasiswa = $pdo->query("SELECT m.*, u.username FROM mahasiswa m JOIN users u ON m.user_id = u.id")->fetchAll();
?>

<section class="content-header">
  <div class="container-fluid">
    <h1>Data Mahasiswa</h1>
  </div>
</section>

<section class="content">
  <div class="container-fluid">
    <div class="card">
      <div class="card-body">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>NIM</th>
              <th>Nama</th>
              <th>Prodi</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach($mahasiswa as $m): ?>
            <tr>
              <td><?= htmlspecialchars($m['nim']) ?></td>
              <td><?= htmlspecialchars($m['nama']) ?></td>
              <td><?= htmlspecialchars($m['prodi']) ?></td>
              <td><?= htmlspecialchars($m['username']) ?></td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<?php require_once '../includes/footer.php'; ?>
