CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'dosen', 'mahasiswa') NOT NULL
);

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    nama VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE dosen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    nidn VARCHAR(20) UNIQUE,
    nama VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE mahasiswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    nim VARCHAR(20) UNIQUE,
    nama VARCHAR(100),
    prodi VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode VARCHAR(20) UNIQUE,
    nama VARCHAR(100),
    sks INT,
    semester INT,
    dosen_id INT,
    FOREIGN KEY (dosen_id) REFERENCES dosen(id) ON DELETE SET NULL
);

CREATE TABLE krs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id INT,
    course_id INT,
    status ENUM('diajukan', 'disetujui', 'ditolak') DEFAULT 'diajukan',
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mahasiswa_id INT,
    course_id INT,
    nilai_angka FLOAT,
    nilai_huruf VARCHAR(2),
    bobot FLOAT,
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Insert dummy data
INSERT INTO users (username, password, role) VALUES 
('admin', '\\\.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'), -- password: password
('dosen1', '\\\.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dosen'), -- password: password
('mahasiswa1', '\\\.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mahasiswa'); -- password: password

INSERT INTO admin (user_id, nama) VALUES (1, 'Administrator');
INSERT INTO dosen (user_id, nidn, nama) VALUES (2, '12345678', 'Dr. Dosen Satu');
INSERT INTO mahasiswa (user_id, nim, nama, prodi) VALUES (3, '2312301001', 'Mahasiswa Satu', 'Teknik Informatika');

INSERT INTO courses (kode, nama, sks, semester, dosen_id) VALUES 
('IF101', 'Pemrograman Web', 3, 1, 1),
('IF102', 'Basis Data', 3, 1, 1);
