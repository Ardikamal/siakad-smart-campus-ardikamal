<?php
require_once '../includes/header.php';
require_once '../config/database.php';

if ($_SESSION['role'] !== 'mahasiswa') {
    header("Location: ../index.php");
    exit;
}

$mahasiswa_id = $_SESSION['profile']['id'];

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['course_id'])) {
    $course_id = $_POST['course_id'];
    
    // Check if already applied
    $stmt = $pdo->prepare("SELECT id FROM krs WHERE mahasiswa_id = ? AND course_id = ?");
    $stmt->execute([$mahasiswa_id, $course_id]);
    
    if (!$stmt->fetch()) {
        $stmt = $pdo->prepare("INSERT INTO krs (mahasiswa_id, course_id, status) VALUES (?, ?, 'diajukan')");
        $stmt->execute([$mahasiswa_id, $course_id]);
        $msg = "Mata kuliah berhasil ditambahkan ke KRS (menunggu persetujuan).";
    } else {
        $error = "Mata kuliah sudah ada di KRS Anda.";
    }
}

// Get available courses
$available_courses = $pdo->query("
    SELECT c.*, d.nama as nama_dosen 
    FROM courses c 
    JOIN dosen d ON c.dosen_id = d.id
")->fetchAll();

// Get current KRS
$my_krs = $pdo->query("
    SELECT k.*, c.nama as nama_mk, c.kode, c.sks 
    FROM krs k 
    JOIN courses c ON k.course_id = c.id 
    WHERE k.mahasiswa_id = $mahasiswa_id
")->fetchAll();
?>

<section class="content-header">
  <div class="container-fluid">
    <h1>Isi KRS</h1>
  </div>
</section>

<section class="content">
  <div class="container-fluid">
    <?php if (isset($msg)) echo "<div class='alert alert-success'>$msg</div>"; ?>
    <?php if (isset($error)) echo "<div class='alert alert-danger'>$error</div>"; ?>
    
    <div class="row">
      <div class="col-md-6">
        <div class="card card-primary">
          <div class="card-header"><h3 class="card-title">Mata Kuliah Tersedia</h3></div>
          <div class="card-body">
            <table class="table table-bordered">
              <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Aksi</th></tr></thead>
              <tbody>
                <?php foreach($available_courses as $c): ?>
                <tr>
                  <td><?= htmlspecialchars($c['kode']) ?></td>
                  <td><?= htmlspecialchars($c['nama']) ?></td>
                  <td><?= $c['sks'] ?></td>
                  <td>
                    <form action="" method="post">
                        <input type="hidden" name="course_id" value="<?= $c['id'] ?>">
                        <button type="submit" class="btn btn-sm btn-success">Ambil</button>
                    </form>
                  </td>
                </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card card-info">
          <div class="card-header"><h3 class="card-title">KRS Saya</h3></div>
          <div class="card-body">
            <table class="table table-bordered">
              <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Status</th></tr></thead>
              <tbody>
                <?php $total_sks = 0; foreach($my_krs as $k): $total_sks += $k['sks']; ?>
                <tr>
                  <td><?= htmlspecialchars($k['kode']) ?></td>
                  <td><?= htmlspecialchars($k['nama_mk']) ?></td>
                  <td><?= $k['sks'] ?></td>
                  <td>
                    <?php
                    if($k['status'] == 'diajukan') echo '<span class="badge badge-warning">Diajukan</span>';
                    else if($k['status'] == 'disetujui') echo '<span class="badge badge-success">Disetujui</span>';
                    else echo '<span class="badge badge-danger">Ditolak</span>';
                    ?>
                  </td>
                </tr>
                <?php endforeach; ?>
              </tbody>
              <tfoot>
                <tr><th colspan="2">Total SKS</th><th colspan="2"><?= $total_sks ?></th></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require_once '../includes/footer.php'; ?>
