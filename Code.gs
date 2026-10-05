/**
 * ============================================================================
 * PUSAT PRESTASI MADRASAH (PUSPRESMA) - BACKEND GOOGLE APPS SCRIPT
 * ============================================================================
 * 1. Simpan data rekapitulasi prestasi siswa ke Google Spreadsheet ("Data_Prestasi")
 * 2. Simpan foto dokumentasi & scan piagam prestasi secara otomatis ke Google Drive
 * 3. Menyediakan link view Google Drive permanen
 * ============================================================================
 * CARA PASANG:
 * 1. Buat Google Spreadsheet baru di https://sheets.new
 * 2. Klik menu "Ekstensi" > "Apps Script"
 * 3. Hapus semua kode default di Code.gs, lalu tempel SELURUH KODE DI BAWAH INI.
 * 4. Klik "Simpan" (ikon disket).
 * 5. Klik "Terapkan (Deploy)" > "Deployment Baru (New Deployment)".
 * 6. Pilih jenis: "Aplikasi Web (Web App)".
 * 7. Konfigurasi:
 *    - Deskripsi: PUSPRESMA Backend
 *    - Jalankan sebagai (Execute as): Saya (akun Anda)
 *    - Siapa yang memiliki akses (Who has access): Siapa saja (Anyone)
 * 8. Klik "Terapkan", berikan otorisasi izin Google Drive & Spreadsheet.
 * 9. Salin "URL Aplikasi Web" (akhiran /exec) dan tempelkan di menu "Google Drive & Sheets" pada aplikasi PUSPRESMA!
 * ============================================================================
 */

var CONFIG = {
  SHEET_PRESTASI: "Data_Prestasi",
  SHEET_PROFIL: "Profil_Madrasah",
  FOLDER_UTAMA: "PUSPRESMA_MADRASAH_ARSIP",
  FOLDER_FOTO: "DOKUMENTASI_KEGIATAN_SISWA",
  FOLDER_PIAGAM: "PIAGAM_SERTIFIKAT_SISWA"
};

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "getAchievements";

    if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify(handlePing()))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default action: mengembalikan seluruh data prestasi dari Google Spreadsheet
    var achievementsResult = handleGetAchievements();
    return ContentService.createTextOutput(JSON.stringify(achievementsResult))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Error doGet: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var action = data.action;

    var responseData;

    switch (action) {
      case "ping":
        responseData = handlePing();
        break;

      case "saveAchievement":
        responseData = handleSaveAchievement(data.achievement);
        break;

      case "getAchievements":
        responseData = handleGetAchievements();
        break;

      case "deleteAchievement":
        responseData = handleDeleteAchievement(data.id);
        break;

      case "syncAll":
        responseData = handleSyncAll(data.achievements, data.schoolProfile);
        break;

      default:
        responseData = { success: false, message: "Aksi tidak dikenali: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Terjadi kesalahan di server Apps Script: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handlePing() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_PRESTASI);
  var folder = getOrCreateFolder(CONFIG.FOLDER_UTAMA);

  return {
    success: true,
    message: "Koneksi berhasil! Spreadsheet dan Google Drive terhubung dengan baik.",
    data: {
      spreadsheetName: ss.getName(),
      sheetName: sheet.getName(),
      folderName: folder.getName(),
      folderUrl: folder.getUrl()
    }
  };
}

function handleSaveAchievement(item) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_PRESTASI);
  setupHeaderIfNeeded(sheet);

  // 1. Simpan Foto Kegiatan ke Google Drive jika berupa Base64 Data URL
  var fotoDriveUrl = item.fotoKegiatanUrl || "";
  if (fotoDriveUrl && fotoDriveUrl.indexOf("data:") === 0) {
    var fotoFolder = getSubFolder(CONFIG.FOLDER_UTAMA, CONFIG.FOLDER_FOTO);
    var fotoName = "Foto_" + sanitizeFilename(item.namaSiswa) + "_" + item.nisn + "_" + new Date().getTime() + ".jpg";
    fotoDriveUrl = saveBase64ToDrive(fotoFolder, fotoDriveUrl, fotoName);
  }

  // 2. Simpan Piagam Sertifikat ke Google Drive jika berupa Base64 Data URL
  var piagamDriveUrl = item.piagamUrl || "";
  if (piagamDriveUrl && piagamDriveUrl.indexOf("data:") === 0) {
    var piagamFolder = getSubFolder(CONFIG.FOLDER_UTAMA, CONFIG.FOLDER_PIAGAM);
    var piagamName = "Piagam_" + sanitizeFilename(item.namaSiswa) + "_" + item.nisn + "_" + new Date().getTime() + ".jpg";
    piagamDriveUrl = saveBase64ToDrive(piagamFolder, piagamDriveUrl, piagamName);
  }

  // 3. Simpan baris ke Google Spreadsheet
  var rows = sheet.getDataRange().getValues();
  var rowIndexToUpdate = -1;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == item.id) {
      rowIndexToUpdate = i + 1;
      break;
    }
  }

  var rowData = [
    item.id,
    item.nisn,
    item.namaSiswa,
    item.kelas,
    item.jenisKelamin,
    item.tahunAjaran,
    item.namaLomba,
    item.jenisPrestasi,
    item.bidangPrestasi,
    item.tingkatLomba,
    item.juara,
    item.penyelenggara,
    item.tanggalPencapaian,
    item.guruPembimbing || "-",
    fotoDriveUrl,
    piagamDriveUrl,
    item.statusVerifikasi || "Terverifikasi",
    item.keterangan || "-",
    new Date().toISOString()
  ];

  if (rowIndexToUpdate > 0) {
    sheet.getRange(rowIndexToUpdate, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return {
    success: true,
    message: "Prestasi siswa berhasil disimpan ke Google Spreadsheet dan berkas tersimpan di Google Drive!",
    fotoUrl: fotoDriveUrl,
    piagamUrl: piagamDriveUrl,
    data: {
      id: item.id,
      fotoKegiatanUrl: fotoDriveUrl,
      piagamUrl: piagamDriveUrl
    }
  };
}

function handleGetAchievements() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_PRESTASI);
  setupHeaderIfNeeded(sheet);

  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { success: true, data: [] };
  }

  var results = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;

    results.push({
      id: String(r[0]),
      nisn: String(r[1]),
      namaSiswa: String(r[2]),
      kelas: String(r[3]),
      jenisKelamin: String(r[4]),
      tahunAjaran: String(r[5]),
      namaLomba: String(r[6]),
      jenisPrestasi: String(r[7]),
      bidangPrestasi: String(r[8]),
      tingkatLomba: String(r[9]),
      juara: String(r[10]),
      penyelenggara: String(r[11]),
      tanggalPencapaian: formatSheetDate(r[12]),
      guruPembimbing: String(r[13] || ""),
      fotoKegiatanUrl: String(r[14] || ""),
      piagamUrl: String(r[15] || ""),
      statusVerifikasi: String(r[16] || "Terverifikasi"),
      keterangan: String(r[17] || ""),
      updatedAt: String(r[18] || new Date().toISOString())
    });
  }

  return {
    success: true,
    data: results,
    count: results.length
  };
}

function handleDeleteAchievement(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_PRESTASI);
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Data prestasi berhasil dihapus dari Spreadsheet." };
    }
  }

  return { success: false, message: "Data ID tidak ditemukan di Spreadsheet." };
}

function handleSyncAll(achievements, profile) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_PRESTASI);
  sheet.clearContents();
  setupHeaderIfNeeded(sheet);

  if (Array.isArray(achievements)) {
    for (var i = 0; i < achievements.length; i++) {
      handleSaveAchievement(achievements[i]);
    }
  }

  return {
    success: true,
    message: "Sinkronisasi massal ke Google Spreadsheet & Drive selesai! (" + achievements.length + " data)"
  };
}

function saveBase64ToDrive(folder, base64Data, filename) {
  try {
    var parts = base64Data.split(",");
    var mime = "image/jpeg";
    if (parts[0].indexOf(":") > -1 && parts[0].indexOf(";") > -1) {
      mime = parts[0].split(":")[1].split(";")[0];
    }
    var rawData = parts[1] || parts[0];
    var decoded = Utilities.base64Decode(rawData);
    var blob = Utilities.newBlob(decoded, mime, filename);

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (err) {
    Logger.log("Gagal simpan ke Drive: " + err);
    return base64Data;
  }
}

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function setupHeaderIfNeeded(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      "ID",
      "NISN",
      "Nama Siswa",
      "Kelas",
      "Jenis Kelamin",
      "Tahun Ajaran",
      "Nama Kejuaraan / Lomba",
      "Jenis Prestasi",
      "Bidang Prestasi",
      "Tingkat",
      "Peringkat / Juara",
      "Penyelenggara",
      "Tanggal Pencapaian",
      "Guru Pembimbing",
      "Link Foto Google Drive",
      "Link Piagam Google Drive",
      "Status Verifikasi",
      "Keterangan",
      "Waktu Input"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#047857")
      .setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  var newFolder = DriveApp.createFolder(folderName);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

function getSubFolder(parentFolderName, subFolderName) {
  var parent = getOrCreateFolder(parentFolderName);
  var subFolders = parent.getFoldersByName(subFolderName);
  if (subFolders.hasNext()) {
    return subFolders.next();
  }
  var newSub = parent.createFolder(subFolderName);
  newSub.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newSub;
}

function sanitizeFilename(name) {
  if (!name) return "file";
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
}

function formatSheetDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(val);
}
