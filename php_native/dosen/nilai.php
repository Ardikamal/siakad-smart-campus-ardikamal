<?php
require_once '../includes/header.php';
require_once '../config/database.php';

if ($_SESSION['role'] !== 'dosen') {
    header("Location: ../index.php");
    exit;
}

$dosen_id = $_SESSION['profile']['id'];

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['mahasiswa_id'])) {
    $mahasiswa_id = $_POST['mahasiswa_id'];
    $course_id = $_POST['course_id'];
    $nilai_angka = (float)$_POST['nilai_angka'];
    
    // Calculate Huruf and Bobot
    if ($nilai_angka >= 85) { $huruf = 'A'; $bobot = 4.0; }
    else if ($nilai_angka >= 80) { $huruf = 'A-'; $bobot = 3.7; }
    else if ($nilai_angka >= 75) { $huruf = 'B+'; $bobot = 3.3; }
    else if ($nilai_angka >= 70) { $huruf = 'B'; $bobot = 3.0; }
    else if ($nilai_angka >= 65) { $huruf = 'B-'; $bobot = 2.7; }
    else if ($nilai_angka >= 60) { $huruf = 'C+'; $bobot = 2.3; }
    else if ($nilai_angka >= 55) { $huruf = 'C'; $bobot = 2.0; }
    else if ($nilai_angka >= 40) { $huruf = 'D'; $bobot = 1.0; }
    else { $huruf = 'E'; $bobot = 0.0; }

    // Check if grade already exists
    $stmt = $pdo->prepare("SELECT id FROM grades WHERE mahasiswa_id = ? AND course_id = ?");
    $stmt->execute([$mahasiswa_id, $course_id]);
    $existing = $stmt->fetch();

    if ($existing) {
        $stmt = $pdo->prepare("UPDATE grades SET nilai_angka = ?, nilai_huruf = ?, bobot = ? WHERE id = ?");
        $stmt->execute([$nilai_angka, $huruf, $bobot, $existing['id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO grades (mahasiswa_id, course_id, nilai_angka, nilai_huruf, bobot) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$mahasiswa_id, $course_id, $nilai_angka, $huruf, $bobot]);
    }
    
    $msg = "Nilai berhasil disimpan.";
}

// Fetch students who have approved KRS for this dosen's courses
$students_krs = $pdo->query("
    SELECT k.id as krs_id, m.id as mahasiswa_id, m.nim, m.nama as nama_mahasiswa, c.id as course_id, c.nama as nama_mk, c.kode, g.nilai_angka, g.nilai_huruf
    FROM krs k
    JOIN mahasiswa m ON k.mahasiswa_id = m.id
    JOIN courses c ON k.course_id = c.id
    LEFT JOIN grades g ON g.mahasiswa_id = m.id AND g.course_id = c.id
    WHERE c.dosen_id = $dosen_id AND k.status = 'disetujui'
")->fetchAll();

?>

<section class="content-header">
  <div class="container-fluid">
    <h1>Input Nilai Mahasiswa</h1>
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
              <th>Nama</th>
              <th>Mata Kuliah</th>
              <th>Nilai Angka</th>
              <th>Nilai Huruf</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach($students_krs as $row): ?>
            <tr>
              <td><?= htmlspecialchars($row['nim']) ?></td>
              <td><?= htmlspecialchars($row['nama_mahasiswa']) ?></td>
              <td><?= htmlspecialchars($row['kode']) ?> - <?= htmlspecialchars($row['nama_mk']) ?></td>
              <form action="" method="post">
                <input type="hidden" name="mahasiswa_id" value="<?= $row['mahasiswa_id'] ?>">
                <input type="hidden" name="course_id" value="<?= $row['course_id'] ?>">
                <td>
                  <input type="number" step="0.01" name="nilai_angka" class="form-control" value="<?= $row['nilai_angka'] ?? '' ?>" required max="100" min="0">
                </td>
                <td>
                  <?= $row['nilai_huruf'] ?? '-' ?>
                </td>
                <td>
                  <button type="submit" class="btn btn-sm btn-primary">Simpan</button>
                </td>
              </form>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<?php require_once '../includes/footer.php'; ?>
