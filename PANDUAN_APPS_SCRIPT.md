# PANDUAN INTEGRASI PUSPRESMA DENGAN GOOGLE APPS SCRIPT, SPREADSHEET & GOOGLE DRIVE

Aplikasi **PUSPRESMA (Pusat Prestasi Madrasah)** telah dilengkapi modul integrasi penuh ke **Google Apps Script**, **Google Spreadsheet** (sebagai database tabel baris), dan **Google Drive** (sebagai penyimpanan berkas foto kegiatan & scan piagam sertifikat).

---

## 📁 Struktur Data Cloud
1. **Google Spreadsheet**:
   - Sheet `Data_Prestasi`: Menyimpan seluruh kolom data (ID, NISN, Nama Siswa, Kelas, Gender, Tahun Ajaran, Nama Lomba, Jenis, Bidang, Tingkat, Juara, Penyelenggara, Tanggal, Guru Pembimbing, **Link Foto Google Drive**, **Link Piagam Google Drive**, Status Verifikasi, Keterangan, Waktu Input).
2. **Google Drive**:
   - Folder Utama: `PUSPRESMA_MADRASAH_ARSIP`
   - Subfolder 1: `DOKUMENTASI_KEGIATAN_SISWA` (Menampung file foto siswa berprestasi)
   - Subfolder 2: `PIAGAM_SERTIFIKAT_SISWA` (Menampung file scan piagam penghargaan siswa)
   - Seluruh file foto & piagam otomatis diatur hak akses publik agar dapat dibuka dan dicetak di laporan PDF.

---

## 🚀 Langkah Instalasi (Hanya 2 Menit)

### Langkah 1: Buat Spreadsheet Baru
1. Buka browser dan kunjungi: **[sheets.new](https://sheets.new)**
2. Beri nama file Google Spreadsheet, misalnya: `PUSPRESMA - Basis Data Prestasi Siswa`.

### Langkah 2: Buka Editor Apps Script
1. Pada menu Spreadsheet atas, klik **Ekstensi (Extensions)** > **Apps Script**.
2. Editor skrip akan terbuka di tab baru.

### Langkah 3: Tempel Kode `Code.gs`
1. Hapus semua baris kode default yang ada di file `Code.gs`.
2. Buka file **`Code.gs`** (tersedia di root project aplikasi ini atau salin langsung dari menu **"Hubungkan Drive & Sheets"** di aplikasi PUSPRESMA).
3. Tempelkan seluruh kode tersebut ke editor Apps Script.
4. Klik tombol **Simpan (ikon disket)** atau tekan `Ctrl + S`.

### Langkah 4: Terapkan sebagai Aplikasi Web (Web App)
1. Klik tombol biru **Terapkan (Deploy)** di kanan atas > pilih **Deployment Baru (New Deployment)**.
2. Klik ikon gerigi (Pilih jenis) > pilih **Aplikasi Web (Web App)**.
3. Konfigurasikan:
   - **Deskripsi**: `Backend PUSPRESMA Madrasah`
   - **Jalankan sebagai (Execute as)**: `Saya (email Anda)`
   - **Siapa yang memiliki akses (Who has access)**: `Siapa saja (Anyone)` *(Wajib dipilih agar aplikasi web dapat mengirim data foto dan tabel).*
4. Klik **Terapkan (Deploy)**.
5. Google akan meminta izin akses (*Authorization required*). Klik **Tinjau Izin (Review Permissions)**, pilih akun Google Anda, klik **Lanjutan (Advanced)** > **Buka Project (tidak aman)** > lalu klik **Izinkan (Allow)**.

### Langkah 5: Salin URL Web App & Tempelkan ke PUSPRESMA
1. Salin **URL Aplikasi Web** yang berakhiran `/exec` (misal: `https://script.google.com/macros/s/AKfycb.../exec`).
2. Kembali ke aplikasi PUSPRESMA, klik tombol **"Hubungkan Drive"** di bilah navigasi atas.
3. Tempelkan URL tersebut ke kolom **URL Deployment Web App Google Apps Script**.
4. Klik tombol **"Simpan & Tes Koneksi"**.
5. Muncul notifikasi hijau: *"Koneksi berhasil! Spreadsheet dan Google Drive terhubung dengan baik."*

---

## ⚡ Fitur yang Otomatis Berjalan
1. **Input Prestasi Otomatis Simpan ke Cloud**: Setiap kali menginput atau mengedit data prestasi beserta foto dan piagam, berkas otomatis dikirim ke Google Apps Script, diunggah ke folder Google Drive, dan ditambahkan ke baris Google Spreadsheet.
2. **Sinkronisasi Massal (Sync All)**: Tombol untuk mengunggah seluruh data yang sudah ada di aplikasi ke Google Spreadsheet dalam sekali klik.
3. **Tarik Data (Pull Data)**: Tombol untuk mengunduh seluruh baris data terbaru dari Google Spreadsheet ke aplikasi PUSPRESMA.
4. **Mode Fleksibel (Hybrid Offline & Online)**: Jika belum menghubungkan Apps Script atau koneksi internet terputus, aplikasi tetap berjalan normal dengan penyimpanan lokal di peramban.
