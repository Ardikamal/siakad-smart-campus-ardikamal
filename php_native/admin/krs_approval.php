<?php
require_once '../includes/header.php';
require_once '../config/database.php';

if ($_SESSION['role'] !== 'admin') {
    header("Location: ../index.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['krs_id'])) {
    $krs_id = $_POST['krs_id'];
    $status = $_POST['status']; // disetujui or ditolak
    $stmt = $pdo->prepare("UPDATE krs SET status = :status WHERE id = :id");
    $stmt->execute(['status' => $status, 'id' => $krs_id]);
    
    // If approved, you could insert into grades table with empty grade, but we can do it when the teacher inputs grade using INSERT IGNORE or ON DUPLICATE KEY UPDATE.
    $msg = "KRS updated successfully.";
}

// Fetch all submitted KRS
$krs_list = $pdo->query("
    SELECT k.id, k.status, m.nama as nama_mahasiswa, m.nim, c.nama as nama_mk, c.kode, c.sks 
    FROM krs k
    JOIN mahasiswa m ON k.mahasiswa_id = m.id
    JOIN courses c ON k.course_id = c.id
    ORDER BY k.id DESC
")->fetchAll();
?>

<section class="content-header">
  <div class="container-fluid">
    <h1>Approval KRS</h1>
  </div>
</section>

<section class="content">
  <div class="container-fluid">
    <?php if (isset($msg)) echo "<div class='alert alert-success'>$msg</div>"; ?>
    <div class="card">
      <div class="card-body">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>NIM</th>
              <th>Mahasiswa</th>
              <th>Kode MK</th>
              <th>Mata Kuliah</th>
              <th>SKS</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach($krs_list as $row): ?>
            <tr>
              <td><?= htmlspecialchars($row['nim']) ?></td>
              <td><?= htmlspecialchars($row['nama_mahasiswa']) ?></td>
              <td><?= htmlspecialchars($row['kode']) ?></td>
              <td><?= htmlspecialchars($row['nama_mk']) ?></td>
              <td><?= $row['sks'] ?></td>
              <td>
                <?php
                if($row['status'] == 'diajukan') echo '<span class="badge badge-warning">Diajukan</span>';
                else if($row['status'] == 'disetujui') echo '<span class="badge badge-success">Disetujui</span>';
                else echo '<span class="badge badge-danger">Ditolak</span>';
                ?>
              </td>
              <td>
                <?php if($row['status'] == 'diajukan'): ?>
                <form action="" method="post" style="display:inline;">
                    <input type="hidden" name="krs_id" value="<?= $row['id'] ?>">
                    <input type="hidden" name="status" value="disetujui">
                    <button type="submit" class="btn btn-sm btn-success">Setujui</button>
                </form>
                <form action="" method="post" style="display:inline;">
                    <input type="hidden" name="krs_id" value="<?= $row['id'] ?>">
                    <input type="hidden" name="status" value="ditolak">
                    <button type="submit" class="btn btn-sm btn-danger">Tolak</button>
                </form>
                <?php endif; ?>
              </td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<?php require_once '../includes/footer.php'; ?>
