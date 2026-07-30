<?php
require_once '../includes/header.php';
require_once '../config/database.php';

if ($_SESSION['role'] !== 'mahasiswa') {
    header("Location: ../index.php");
    exit;
}

$mahasiswa_id = $_SESSION['profile']['id'];

// Get grades
$grades = $pdo->query("
    SELECT g.*, c.nama as nama_mk, c.kode, c.sks 
    FROM grades g 
    JOIN courses c ON g.course_id = c.id 
    WHERE g.mahasiswa_id = $mahasiswa_id
")->fetchAll();

$total_sks = 0;
$total_bobot_sks = 0;
?>

<section class="content-header">
  <div class="container-fluid">
    <h1>KHS & Transkrip Nilai</h1>
  </div>
</section>

<section class="content">
  <div class="container-fluid">
    <div class="card">
      <div class="card-body">
        <table class="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Kode MK</th>
              <th>Mata Kuliah</th>
              <th>SKS</th>
              <th>Nilai Angka</th>
              <th>Nilai Huruf</th>
              <th>Bobot</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach($grades as $g): 
                $total_sks += $g['sks'];
                $total_bobot_sks += ($g['bobot'] * $g['sks']);
            ?>
            <tr>
              <td><?= htmlspecialchars($g['kode']) ?></td>
              <td><?= htmlspecialchars($g['nama_mk']) ?></td>
              <td><?= $g['sks'] ?></td>
              <td><?= $g['nilai_angka'] ?></td>
              <td><?= $g['nilai_huruf'] ?></td>
              <td><?= $g['bobot'] ?></td>
            </tr>
            <?php endforeach; ?>
          </tbody>
          <tfoot>
            <?php $ipk = $total_sks > 0 ? number_format($total_bobot_sks / $total_sks, 2) : '0.00'; ?>
            <tr>
              <th colspan="2" class="text-right">Total SKS</th>
              <th><?= $total_sks ?></th>
              <th colspan="2" class="text-right">IPK</th>
              <th><?= $ipk ?></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</section>

<?php require_once '../includes/footer.php'; ?>
