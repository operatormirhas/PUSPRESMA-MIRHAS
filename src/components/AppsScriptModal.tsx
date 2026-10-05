import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Cloud, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  FolderSync,
  HelpCircle,
  Sparkles,
  Link2,
  Clock,
  Layers,
  Code2,
  Users
} from 'lucide-react';
import { 
  testAppsScriptConnection, 
  saveAppsScriptUrl, 
  APPS_SCRIPT_CODE_GS, 
  APPS_SCRIPT_INDEX_HTML,
  sendToAppsScript, 
  fetchAchievementsFromGAS,
  getStoredAutoSyncEnabled,
  saveAutoSyncEnabled,
  getStoredSyncInterval,
  saveSyncInterval
} from '../utils/appsScript';
import { StudentAchievement, SchoolProfile } from '../types';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  appsScriptUrl: string;
  onUrlChange: (newUrl: string) => void;
  achievements: StudentAchievement[];
  schoolProfile: SchoolProfile;
  onDataSynced: (newAchievements: StudentAchievement[]) => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  syncInterval: number;
  onChangeSyncInterval: (seconds: number) => void;
  lastSyncTime: Date | null;
  onManualSync: () => void;
  isCloudSyncing: boolean;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({
  isOpen,
  onClose,
  appsScriptUrl,
  onUrlChange,
  achievements,
  schoolProfile,
  onDataSynced,
  autoSyncEnabled,
  onToggleAutoSync,
  syncInterval,
  onChangeSyncInterval,
  lastSyncTime,
  onManualSync,
  isCloudSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'html' | 'tutorial'>('config');
  const [inputUrl, setInputUrl] = useState(appsScriptUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    sheetName?: string;
    folderName?: string;
  } | null>(null);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [hasCopiedHtml, setHasCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    const trimmed = inputUrl.trim();
    onUrlChange(trimmed);
    saveAppsScriptUrl(trimmed);

    if (!trimmed) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testAppsScriptConnection(trimmed);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSyncLocalToGAS = async () => {
    if (!inputUrl.trim()) {
      alert('Konfigurasikan dan tes koneksi Web App terlebih dahulu.');
      return;
    }

    if (!window.confirm(`Kirim seluruh ${achievements.length} data prestasi lokal saat ini ke Google Spreadsheet dan simpan foto ke Google Drive?`)) {
      return;
    }

    setIsSyncing(true);
    try {
      const res = await sendToAppsScript(inputUrl.trim(), 'syncAll', {
        achievements,
        schoolProfile,
      });

      if (res.success) {
        alert(res.message || 'Sinkronisasi ke Google Spreadsheet & Drive berhasil!');
        // Refresh local data from sheet to get Drive URLs
        try {
          const freshData = await fetchAchievementsFromGAS(inputUrl.trim());
          if (freshData.length > 0) {
            onDataSynced(freshData);
          }
        } catch {
          // ignore
        }
      } else {
        alert('Gagal sinkronisasi: ' + res.message);
      }
    } catch (err: any) {
      alert('Error saat sinkronisasi: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromGAS = async () => {
    if (!inputUrl.trim()) {
      alert('Masukkan URL Web App terlebih dahulu.');
      return;
    }

    setIsPulling(true);
    try {
      const freshData = await fetchAchievementsFromGAS(inputUrl.trim());
      if (Array.isArray(freshData)) {
        if (freshData.length === 0) {
          alert('Google Spreadsheet masih kosong (belum ada baris data).');
        } else {
          onDataSynced(freshData);
          alert(`Berhasil menarik ${freshData.length} data prestasi dari Google Spreadsheet!`);
        }
      }
    } catch (err: any) {
      alert('Gagal mengambil data dari Google Spreadsheet: ' + err.message);
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE_GS);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_INDEX_HTML);
    setHasCopiedHtml(true);
    setTimeout(() => setHasCopiedHtml(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-200 shrink-0">
              <Cloud className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Integrasi Google Apps Script, Spreadsheet & Drive</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 border border-emerald-500/40">
                  Real-Time Sync
                </span>
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Data otomatis tersimpan di Spreadsheet, foto di Google Drive, dan tersinkron real-time untuk semua pengguna yang membuka bersamaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-semibold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Koneksi & Auto-Sync
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Backend Apps Script (Code.gs)
          </button>

          <button
            onClick={() => setActiveTab('html')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'html'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Jalankan di Apps Script (Index.html)
          </button>

          <button
            onClick={() => setActiveTab('tutorial')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tutorial'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Panduan 5 Langkah
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Status Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    appsScriptUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {appsScriptUrl ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <AlertCircle className="w-5 h-5 text-amber-700" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>Status Koneksi: {appsScriptUrl ? 'Terhubung ke Google Spreadsheet' : 'Belum Terhubung'}</span>
                      {appsScriptUrl && autoSyncEnabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Live Sync Aktif
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {appsScriptUrl 
                        ? `Sinkronisasi otomatis aktif setiap ${syncInterval} detik. Data di aplikasi ini dan Spreadsheet selalu sama secara real-time.` 
                        : 'Masukkan URL Web App Google Apps Script di bawah untuk mengaktifkan sinkronisasi otomatis.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onManualSync()}
                    disabled={!appsScriptUrl || isCloudSyncing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                    <span>{isCloudSyncing ? 'Menyinkronkan...' : 'Sinkron Sekarang'}</span>
                  </button>
                </div>
              </div>

              {/* Multi-User Real-time Sync Highlight */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
                <Users className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-900">
                    Sinkronisasi Multi-User Otomatis (Waktu Bersamaan)
                  </p>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Ketika beberapa orang membuka aplikasi ini di waktu yang sama, atau ketika ada admin yang mengedit baris langsung di Google Spreadsheet, aplikasi secara otomatis membaca data terbaru secara berkala. Semua layar pengguna selalu menampilkan data yang sama persis tanpa perlu me-reload halaman!
                  </p>
                </div>
              </div>

              {/* Form Input Web App URL */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800">
                  URL Deployment Web App Google Apps Script
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="flex-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-slate-900"
                  />
                  <button
                    onClick={handleSaveAndTest}
                    disabled={isTesting}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Menguji...' : 'Simpan & Tes Koneksi'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Dapatkan URL ini dari menu <strong>Deploy &gt; New deployment &gt; Web app</strong> di editor Google Apps Script Anda.
                </p>
              </div>

              {/* Auto Sync Settings */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  Pengaturan Sinkronisasi Otomatis di Latar Belakang
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-800 text-xs">Auto-Sync Otomatis</p>
                      <p className="text-[11px] text-slate-500">Cek perubahan di Spreadsheet secara berkala</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoSyncEnabled} 
                        onChange={(e) => onToggleAutoSync(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-800 text-xs">Interval Sinkronisasi</p>
                      <p className="text-[11px] text-slate-500">Frekuensi sinkron data latar belakang</p>
                    </div>
                    <select
                      value={syncInterval}
                      onChange={(e) => onChangeSyncInterval(Number(e.target.value))}
                      className="px-2.5 py-1 text-xs border border-slate-200 rounded-md font-semibold text-slate-800 bg-slate-50"
                    >
                      <option value="10">Setiap 10 Detik</option>
                      <option value="15">Setiap 15 Detik (Disarankan)</option>
                      <option value="30">Setiap 30 Detik</option>
                      <option value="60">Setiap 1 Menit</option>
                    </select>
                  </div>
                </div>
                {lastSyncTime && (
                  <p className="text-[11px] text-slate-500">
                    Terakhir disinkronkan: <span className="font-semibold text-emerald-800">{lastSyncTime.toLocaleTimeString('id-ID')}</span>
                  </p>
                )}
              </div>

              {/* Test Connection Output */}
              {testResult && (
                <div className={`p-4 rounded-xl border text-xs ${
                  testResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-bold text-xs">
                        {testResult.success ? 'Koneksi Berhasil!' : 'Koneksi Gagal'}
                      </h4>
                      <p className="text-[11px] mt-0.5">{testResult.message}</p>
                      {testResult.success && testResult.sheetName && (
                        <div className="mt-2 text-[11px] font-mono text-emerald-800 space-y-0.5">
                          <p>Sheet Database: <strong>{testResult.sheetName}</strong></p>
                          <p>Folder Google Drive: <strong>{testResult.folderName}</strong></p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons: Sync & Pull */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FolderSync className="w-4 h-4 text-emerald-700" />
                      Kirim Seluruh Data ke Spreadsheet & Drive
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 mb-3">
                      Mengunggah seluruh {achievements.length} data prestasi lokal saat ini ke Google Spreadsheet dan menyimpan foto/piagam ke folder Google Drive.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncLocalToGAS}
                    disabled={isSyncing || !inputUrl.trim()}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <FolderSync className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Mengunggah ke Cloud...' : 'Sinkronkan Sekarang'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                      Tarik Data dari Google Spreadsheet
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 mb-3">
                      Mengambil seluruh data prestasi terbaru yang ada di baris Google Spreadsheet ke aplikasi ini.
                    </p>
                  </div>
                  <button
                    onClick={handlePullFromGAS}
                    disabled={isPulling || !inputUrl.trim()}
                    className="w-full py-2 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                    <span>{isPulling ? 'Mengunduh...' : 'Tarik Data dari Spreadsheet'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">
                    File Sumber Google Apps Script (Code.gs)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Salin seluruh kode di bawah ini dan tempelkan ke file <code>Code.gs</code> di editor Apps Script Google Spreadsheet Anda.
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {hasCopiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopiedCode ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px]">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Code.gs</span>
                  <span>Google Apps Script / SpreadsheetApp & DriveApp</span>
                </div>
                <pre className="p-4 max-h-96 overflow-y-auto leading-relaxed">
                  <code>{APPS_SCRIPT_CODE_GS}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">
                    File Antarmuka Web Apps Script (Index.html)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Buat file baru di Apps Script dengan nama <code>Index.html</code> (klik + &gt; HTML), lalu salin kode di bawah ini. Aplikasi akan langsung berjalan di Google Apps Script!
                  </p>
                </div>
                <button
                  onClick={handleCopyHtml}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {hasCopiedHtml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopiedHtml ? 'Tersalin!' : 'Salin Index.html'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px]">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Index.html</span>
                  <span>HTML5 / Tailwind CSS / Apps Script Client</span>
                </div>
                <pre className="p-4 max-h-96 overflow-y-auto leading-relaxed">
                  <code>{APPS_SCRIPT_INDEX_HTML}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tutorial' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80">
                <h4 className="font-bold text-emerald-950 text-sm mb-1">
                  Panduan Menjalankan PUSPRESMA di Google Apps Script, Spreadsheet & Drive
                </h4>
                <p className="text-emerald-900 text-xs leading-relaxed">
                  Ikuti 5 langkah mudah berikut ini. Backend Google Apps Script sepenuhnya gratis dan terhubung langsung ke akun Google Workspace / Gmail madrasah Anda:
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: '1',
                    title: 'Buat Google Spreadsheet Baru',
                    desc: 'Buka sheets.new di browser Anda menggunakan akun Google madrasah atau pribadi. Beri judul dokumen misalnya "PUSPRESMA - Basis Data Prestasi Siswa".'
                  },
                  {
                    step: '2',
                    title: 'Buka Editor Apps Script',
                    desc: 'Pada menu Spreadsheet atas, klik "Ekstensi" (Extensions) lalu pilih "Apps Script". Sebuah tab editor skrip akan terbuka.'
                  },
                  {
                    step: '3',
                    title: 'Tempel Kode Backend (Code.gs) & Index.html',
                    desc: 'Hapus fungsi kosong myFunction() di Code.gs, salin kode dari tab "Backend Apps Script (Code.gs)" pada modal ini, dan tempelkan. Jika ingin web app berjalan langsung di Google Apps Script, buat file baru Index.html dan tempelkan kodenya.'
                  },
                  {
                    step: '4',
                    title: 'Deploy sebagai Aplikasi Web (Web App)',
                    desc: 'Klik tombol biru "Terapkan" (Deploy) di kanan atas > "Deployment baru" (New deployment). Pilih jenis "Aplikasi Web". Atur "Jalankan sebagai: Saya (akun Anda)" dan "Siapa yang memiliki akses: Siapa saja (Anyone)".'
                  },
                  {
                    step: '5',
                    title: 'Salin URL & Tempel di Aplikasi PUSPRESMA',
                    desc: 'Izinkan akses otorisasi Google Drive & Spreadsheet saat diminta. Salin "URL Aplikasi Web" (yang berakhiran /exec), lalu buka tab "Koneksi & Auto-Sync" di modal ini dan tempelkan. Klik "Simpan & Tes Koneksi". Selesai! Semua data prestasi, foto, dan piagam otomatis tersimpan dan tersinkronisasi real-time.'
                  },
                ].map((item) => (
                  <div key={item.step} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            {appsScriptUrl ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung ke Google Spreadsheet & Drive
              </span>
            ) : (
              <span>Menggunakan mode penyimpanan lokal</span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
