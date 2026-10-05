import { StudentAchievement, SchoolProfile } from '../types';

const APPS_SCRIPT_URL_KEY = 'puspresma_apps_script_url';
const AUTO_SYNC_ENABLED_KEY = 'puspresma_auto_sync_enabled';
const SYNC_INTERVAL_KEY = 'puspresma_sync_interval';
const LAST_SYNC_TIME_KEY = 'puspresma_last_sync_time';

export function getStoredAppsScriptUrl(): string {
  try {
    return localStorage.getItem(APPS_SCRIPT_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function saveAppsScriptUrl(url: string): void {
  try {
    localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim());
  } catch (err) {
    console.error('Gagal menyimpan URL Apps Script:', err);
  }
}

export function getStoredAutoSyncEnabled(): boolean {
  try {
    const val = localStorage.getItem(AUTO_SYNC_ENABLED_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function saveAutoSyncEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (err) {
    console.error('Gagal menyimpan pengaturan auto sync:', err);
  }
}

export function getStoredSyncInterval(): number {
  try {
    const val = localStorage.getItem(SYNC_INTERVAL_KEY);
    const parsed = val ? parseInt(val, 10) : 15;
    return isNaN(parsed) || parsed < 5 ? 15 : parsed;
  } catch {
    return 15;
  }
}

export function saveSyncInterval(seconds: number): void {
  try {
    localStorage.setItem(SYNC_INTERVAL_KEY, String(seconds));
  } catch (err) {
    console.error('Gagal menyimpan interval sync:', err);
  }
}

export function getStoredLastSyncTime(): string | null {
  try {
    return localStorage.getItem(LAST_SYNC_TIME_KEY);
  } catch {
    return null;
  }
}

export function saveLastSyncTime(isoString: string): void {
  try {
    localStorage.setItem(LAST_SYNC_TIME_KEY, isoString);
  } catch (err) {
    console.error('Gagal menyimpan waktu sync:', err);
  }
}

export interface GASResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  fotoUrl?: string;
  piagamUrl?: string;
}

/**
 * Send request to Google Apps Script Web App
 */
export async function sendToAppsScript(
  url: string,
  action: string,
  payload: any = {}
): Promise<GASResponse> {
  if (!url) {
    throw new Error('URL Google Apps Script belum dikonfigurasi.');
  }

  const cleanUrl = url.trim();
  const requestBody = JSON.stringify({
    action,
    ...payload,
  });

  try {
    // Note: Content-Type text/plain avoids CORS preflight OPTIONS request in browser
    const response = await fetch(cleanUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error(`Server Apps Script merespons dengan status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error('Error Apps Script:', err);
    throw new Error(err.message || 'Gagal berkomunikasi dengan Google Apps Script. Pastikan deployment diatur ke "Anyone".');
  }
}

/**
 * Test connectivity with Google Apps Script
 */
export async function testAppsScriptConnection(url: string): Promise<{ success: boolean; message: string; sheetName?: string; folderName?: string }> {
  try {
    const res = await sendToAppsScript(url, 'ping', {});
    if (res.success) {
      return {
        success: true,
        message: res.message || 'Koneksi ke Google Spreadsheet & Google Drive berhasil!',
        sheetName: res.data?.sheetName || 'Data_Prestasi',
        folderName: res.data?.folderName || 'PUSPRESMA_MADRASAH_ARSIP',
      };
    }
    return {
      success: false,
      message: res.message || 'Koneksi gagal. Periksa kembali pengaturan deployment Apps Script.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal terhubung ke Google Apps Script.',
    };
  }
}

/**
 * Send single achievement to Google Apps Script (writes to Spreadsheet and saves photos to Google Drive)
 */
export async function saveAchievementToGAS(
  url: string,
  achievement: StudentAchievement
): Promise<{ success: boolean; fotoKegiatanUrl?: string; piagamUrl?: string; message?: string }> {
  try {
    const res = await sendToAppsScript(url, 'saveAchievement', {
      achievement,
    });

    return {
      success: res.success,
      fotoKegiatanUrl: res.fotoUrl || res.data?.fotoKegiatanUrl,
      piagamUrl: res.piagamUrl || res.data?.piagamUrl,
      message: res.message,
    };
  } catch (err: any) {
    console.error('Gagal mengirim ke Google Apps Script:', err);
    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * Fetch all achievements from Google Spreadsheet (supports fast GET with fallback to POST)
 */
export async function fetchAchievementsFromGAS(url: string): Promise<StudentAchievement[]> {
  if (!url) throw new Error('URL Apps Script belum diisi');

  const cleanUrl = url.trim();

  // 1. Try fast GET request with cache-busting timestamp
  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const getUrl = `${cleanUrl}${separator}action=getAchievements&_t=${Date.now()}`;
    const response = await fetch(getUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const json = await response.json();
      if (json && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (getErr) {
    console.warn('GET fetch failed, trying POST...', getErr);
  }

  // 2. Fallback to POST
  const res = await sendToAppsScript(cleanUrl, 'getAchievements', {});
  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }
  throw new Error(res?.message || 'Gagal mengambil data dari Spreadsheet');
}

/**
 * Delete achievement row from Google Spreadsheet
 */
export async function deleteAchievementFromGAS(url: string, id: string): Promise<boolean> {
  try {
    const res = await sendToAppsScript(url, 'deleteAchievement', { id });
    return !!res.success;
  } catch (err) {
    console.error('Gagal menghapus di GAS:', err);
    return false;
  }
}

/**
 * Complete Google Apps Script (Code.gs) source code ready to copy-paste into Google Apps Script editor
 */
export const APPS_SCRIPT_CODE_GS = `/**
 * ============================================================================
 * PUSAT PRESTASI MADRASAH (PUSPRESMA) - BACKEND GOOGLE APPS SCRIPT
 * ============================================================================
 * Kode ini berfungsi sebagai Backend, Database API, dan Web Server:
 * 1. Menyimpan data prestasi siswa ke Google Spreadsheet ("Data_Prestasi")
 * 2. Menyimpan foto kegiatan & scan piagam ke Google Drive ("PUSPRESMA_MADRASAH_ARSIP")
 * 3. Menghubungkan multi-user secara real-time (otomatis tersinkron)
 * 4. Dapat berjalan langsung sebagai Web App di Google Apps Script (doGet)
 * ============================================================================
 */

// Konfigurasi Nama Sheet dan Folder Google Drive
var CONFIG = {
  SHEET_PRESTASI: "Data_Prestasi",
  SHEET_PROFIL: "Profil_Madrasah",
  FOLDER_UTAMA: "PUSPRESMA_MADRASAH_ARSIP",
  FOLDER_FOTO: "DOKUMENTASI_KEGIATAN_SISWA",
  FOLDER_PIAGAM: "PIAGAM_SERTIFIKAT_SISWA"
};

/**
 * Handler GET
 * 1. Jika parameter ?action=getAchievements -> Mengembalikan seluruh data dalam format JSON
 * 2. Jika parameter ?action=ping -> Tes koneksi Spreadsheet & Drive
 * 3. Jika dibuka langsung di browser -> Menampilkan aplikasi PUSPRESMA (HtmlService)
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "";

    if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify(handlePing()))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "getAchievements") {
      var achievementsResult = handleGetAchievements();
      return ContentService.createTextOutput(JSON.stringify(achievementsResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Jika dibuka langsung via browser di Google Apps Script, sajikan halaman HTML Aplikasi
    try {
      var html = HtmlService.createTemplateFromFile("Index").evaluate();
      return html
        .setTitle("PUSPRESMA - Pusat Prestasi Madrasah")
        .addMetaTag("viewport", "width=device-width, initial-scale=1")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (errHtml) {
      // Jika file Index.html belum dibuat di project Apps Script, kembalikan JSON data
      return ContentService.createTextOutput(JSON.stringify(handleGetAchievements()))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Error doGet: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handler POST (Menerima permintaan simpan/hapus/sinkronisasi dari Web App PUSPRESMA)
 */
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

/**
 * Uji koneksi Spreadsheet & Drive
 */
function handlePing() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_PRESTASI);
  var folder = getOrCreateFolder(CONFIG.FOLDER_UTAMA);

  return {
    success: true,
    message: "Koneksi berhasil! Google Spreadsheet dan Google Drive terhubung.",
    data: {
      spreadsheetName: ss.getName(),
      sheetName: sheet.getName(),
      folderName: folder.getName(),
      folderUrl: folder.getUrl()
    }
  };
}

/**
 * Simpan atau perbarui satu prestasi siswa
 * Jika terdapat fotoKegiatanUrl / piagamUrl dalam bentuk Base64,
 * file otomatis dikonversi dan disimpan ke Google Drive.
 */
function handleSaveAchievement(item) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSheet(ss, CONFIG.SHEET_PRESTASI);
  setupHeaderIfNeeded(sheet);

  // 1. Simpan Foto Kegiatan ke Google Drive jika berupa Base64
  var fotoDriveUrl = item.fotoKegiatanUrl || "";
  if (fotoDriveUrl && fotoDriveUrl.indexOf("data:") === 0) {
    var fotoFolder = getSubFolder(CONFIG.FOLDER_UTAMA, CONFIG.FOLDER_FOTO);
    var fotoName = "Foto_" + sanitizeFilename(item.namaSiswa) + "_" + item.nisn + "_" + new Date().getTime() + ".jpg";
    fotoDriveUrl = saveBase64ToDrive(fotoFolder, fotoDriveUrl, fotoName);
  }

  // 2. Simpan Piagam Sertifikat ke Google Drive jika berupa Base64
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
      rowIndexToUpdate = i + 1; // 1-indexed for Sheets
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

/**
 * Mengambil seluruh data prestasi dari Google Spreadsheet
 */
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
    if (!r[0]) continue; // Lewati baris kosong

    results.push({
      id: String(r[0]),
      nisn: String(r[1]),
      namaSiswa: String(r[2]),
      kelas: String(r[3]),
      jenisKelamin: String(r[4] || "L"),
      tahunAjaran: String(r[5] || "2026/2027"),
      namaLomba: String(r[6] || ""),
      jenisPrestasi: String(r[7] || "Akademik"),
      bidangPrestasi: String(r[8] || "Lainnya"),
      tingkatLomba: String(r[9] || "Kabupaten/Kota"),
      juara: String(r[10] || "Juara 1"),
      penyelenggara: String(r[11] || ""),
      tanggalPencapaian: formatSheetDate(r[12]),
      guruPembimbing: String(r[13] || ""),
      fotoKegiatanUrl: String(r[14] || ""),
      piagamUrl: String(r[15] || ""),
      statusVerifikasi: String(r[16] || "Terverifikasi"),
      keterangan: String(r[17] || ""),
      createdAt: String(r[18] || new Date().toISOString()),
      updatedAt: String(r[18] || new Date().toISOString())
    });
  }

  return {
    success: true,
    data: results,
    count: results.length
  };
}

/**
 * Hapus data prestasi berdasarkan ID
 */
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

/**
 * Sinkronisasi massal seluruh data
 */
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

// ============================================================================
// FUNGSI PEMBANTU GOOGLE DRIVE & SPREADSHEET
// ============================================================================

/**
 * Simpan Data URL Base64 ke File Google Drive dengan Hak Akses Terbuka
 */
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
    // Beri izin akses baca bagi yang memiliki link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // URL langsung pratinjau file Google Drive
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (err) {
    Logger.log("Gagal simpan ke Drive: " + err);
    return base64Data; // fallback
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
`;

/**
 * Complete Google Apps Script HTML Frontend (Index.html) ready to create in Google Apps Script editor
 * Allows running PUSPRESMA directly inside Google Apps Script Web App (script.google.com)
 */
export const APPS_SCRIPT_INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PUSPRESMA - Pusat Prestasi Madrasah (Google Apps Script)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col">

  <!-- Header -->
  <header class="bg-emerald-900 text-white shadow-md sticky top-0 z-30 no-print">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-emerald-800 border border-emerald-700 flex items-center justify-center font-bold text-lg text-emerald-200">
          🏆
        </div>
        <div>
          <h1 class="font-extrabold text-lg leading-tight tracking-tight">PUSPRESMA</h1>
          <p class="text-xs text-emerald-200">Pusat Prestasi Madrasah · Berjalan di Google Apps Script & Sheets</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-800 text-emerald-100 border border-emerald-700">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Tersambung Google Sheets
        </span>
        <button onclick="loadData()" class="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold transition-colors flex items-center gap-1">
          🔄 Segarkan
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl w-full mx-auto px-4 py-6 flex-1 space-y-6">
    <!-- Stat Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <p class="text-xs text-slate-500 font-medium">Total Prestasi</p>
        <p id="stat-total" class="text-2xl font-bold text-emerald-700 mt-1">0</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <p class="text-xs text-slate-500 font-medium">Tingkat Nasional & Internasional</p>
        <p id="stat-nasional" class="text-2xl font-bold text-amber-600 mt-1">0</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <p class="text-xs text-slate-500 font-medium">Siswa Berprestasi</p>
        <p id="stat-siswa" class="text-2xl font-bold text-teal-700 mt-1">0</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <p class="text-xs text-slate-500 font-medium">Status Sinkronisasi</p>
        <p class="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
          🟢 Real-Time Aktif
        </p>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
      <div class="flex-1 w-full flex items-center gap-2">
        <input 
          type="text" 
          id="search-input" 
          placeholder="Cari nama siswa, NISN, atau kejuaraan..." 
          oninput="renderTable()"
          class="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
        <select id="filter-tahun" onchange="renderTable()" class="px-3 py-2 text-xs border border-slate-200 rounded-lg">
          <option value="Semua">Semua Tahun Ajaran</option>
          <option value="2026/2027">2026/2027</option>
          <option value="2025/2026">2025/2026</option>
          <option value="2024/2025">2024/2025</option>
        </select>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button onclick="window.print()" class="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold">
          🖨️ Cetak Rekap PDF
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="py-3 px-4">No</th>
              <th class="py-3 px-4">Siswa & NISN</th>
              <th class="py-3 px-4">Kelas</th>
              <th class="py-3 px-4">Nama Kejuaraan / Lomba</th>
              <th class="py-3 px-4">Tingkat</th>
              <th class="py-3 px-4">Juara</th>
              <th class="py-3 px-4">Tanggal</th>
              <th class="py-3 px-4 text-center">Berkas Drive</th>
            </tr>
          </thead>
          <tbody id="achievement-rows" class="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td colspan="8" class="text-center py-8 text-slate-400">
                Memuat data dari Google Spreadsheet...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
    PUSPRESMA · Pusat Prestasi Madrasah Terpadu · Berjalan di Google Apps Script & Google Drive
  </footer>

  <script>
    let allData = [];

    function loadData() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function(res) {
          if (res && res.data) {
            allData = res.data;
            renderTable();
          }
        }).handleGetAchievements();
      } else {
        // Fallback fetch jika diuji di browser
        fetch(window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'action=getAchievements')
          .then(r => r.json())
          .then(res => {
            if (res && res.data) {
              allData = res.data;
              renderTable();
            }
          })
          .catch(e => console.log('Load error:', e));
      }
    }

    function renderTable() {
      const q = (document.getElementById('search-input').value || '').toLowerCase();
      const th = document.getElementById('filter-tahun').value;

      const filtered = allData.filter(item => {
        const matchQ = !q || (item.namaSiswa || '').toLowerCase().includes(q) || (item.namaLomba || '').toLowerCase().includes(q) || (item.nisn || '').includes(q);
        const matchTh = th === 'Semua' || item.tahunAjaran === th;
        return matchQ && matchTh;
      });

      document.getElementById('stat-total').innerText = filtered.length;
      document.getElementById('stat-nasional').innerText = filtered.filter(i => i.tingkatLomba === 'Nasional' || i.tingkatLomba === 'Internasional').length;
      document.getElementById('stat-siswa').innerText = new Set(filtered.map(i => i.nisn || i.namaSiswa)).size;

      const tbody = document.getElementById('achievement-rows');
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-400">Tidak ada data prestasi yang cocok.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map((item, idx) => \`
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td class="py-3 px-4 font-mono text-slate-400">\${idx + 1}</td>
          <td class="py-3 px-4">
            <p class="font-bold text-slate-900">\${item.namaSiswa}</p>
            <p class="text-[10px] text-slate-400 font-mono">NISN: \${item.nisn}</p>
          </td>
          <td class="py-3 px-4 font-semibold">\${item.kelas}</td>
          <td class="py-3 px-4">
            <p class="font-medium text-slate-800">\${item.namaLomba}</p>
            <p class="text-[10px] text-emerald-700">\${item.bidangPrestasi || item.jenisPrestasi}</p>
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              \${item.tingkatLomba}
            </span>
          </td>
          <td class="py-3 px-4 font-bold text-amber-700">\${item.juara}</td>
          <td class="py-3 px-4 text-slate-500 whitespace-nowrap">\${item.tanggalPencapaian}</td>
          <td class="py-3 px-4 text-center whitespace-nowrap">
            \${item.fotoKegiatanUrl ? \`<a href="\${item.fotoKegiatanUrl}" target="_blank" class="text-emerald-700 underline font-semibold mr-2">Foto</a>\` : ''}
            \${item.piagamUrl ? \`<a href="\${item.piagamUrl}" target="_blank" class="text-blue-700 underline font-semibold">Piagam</a>\` : ''}
          </td>
        </tr>
      \`).join('');
    }

    // Muat data saat halaman dibuka
    window.onload = function() {
      loadData();
      // Auto-refresh setiap 15 detik jika dibuka bersamaan
      setInterval(loadData, 15000);
    };
  </script>
</body>
</html>`;
