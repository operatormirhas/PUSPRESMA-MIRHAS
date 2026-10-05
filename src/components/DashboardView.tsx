import React, { useMemo } from 'react';
import { StudentAchievement, SchoolProfile, TingkatLomba } from '../types';
import { 
  Trophy, 
  Award, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Eye, 
  FileText, 
  PlusCircle, 
  Printer, 
  ArrowUpRight,
  LogIn,
  ShieldAlert,
  Info,
  Cloud,
  RefreshCw,
  CheckCircle2,
  FolderSync
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/storage';

interface DashboardViewProps {
  achievements: StudentAchievement[];
  schoolProfile: SchoolProfile;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onNavigateToData: (filterYear?: string) => void;
  onOpenInput: () => void;
  onOpenPrint: () => void;
  onViewDetail: (item: StudentAchievement) => void;
  appsScriptUrl?: string;
  isCloudSyncing?: boolean;
  lastSyncTime?: Date | null;
  autoSyncEnabled?: boolean;
  onManualSync?: () => void;
  onToggleAutoSync?: (enabled: boolean) => void;
  onOpenAppsScript?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  achievements,
  schoolProfile,
  isAdmin,
  onOpenLogin,
  onNavigateToData,
  onOpenInput,
  onOpenPrint,
  onViewDetail,
  appsScriptUrl,
  isCloudSyncing,
  lastSyncTime,
  autoSyncEnabled = true,
  onManualSync,
  onToggleAutoSync,
  onOpenAppsScript,
}) => {
  // Real-time calculations
  const stats = useMemo(() => {
    const total = achievements.length;
    const currentYearCount = achievements.filter(
      (a) => a.tahunAjaran === schoolProfile.tahunAjaranAktif
    ).length;
    
    const nationalAndIntl = achievements.filter(
      (a) => a.tingkatLomba === 'Nasional' || a.tingkatLomba === 'Internasional'
    ).length;

    // Unique students by NISN or name
    const uniqueStudents = new Set(achievements.map((a) => a.nisn || a.namaSiswa)).size;

    // Breakdown by Tingkat
    const tingkatCounts: Record<TingkatLomba, number> = {
      'Internasional': 0,
      'Nasional': 0,
      'Provinsi': 0,
      'Kabupaten/Kota': 0,
      'Kecamatan': 0
    };

    achievements.forEach((a) => {
      if (tingkatCounts[a.tingkatLomba] !== undefined) {
        tingkatCounts[a.tingkatLomba]++;
      }
    });

    // Breakdown by Bidang
    const bidangCounts: Record<string, number> = {};
    achievements.forEach((a) => {
      bidangCounts[a.bidangPrestasi] = (bidangCounts[a.bidangPrestasi] || 0) + 1;
    });

    // Breakdown by Tahun Ajaran
    const yearCounts: Record<string, number> = {};
    achievements.forEach((a) => {
      yearCounts[a.tahunAjaran] = (yearCounts[a.tahunAjaran] || 0) + 1;
    });

    // Leaderboard top students by achievement count
    const studentMap: Record<string, { nama: string; nisn: string; kelas: string; count: number; goldCount: number; medals: string[] }> = {};
    achievements.forEach((a) => {
      const key = a.nisn || a.namaSiswa;
      if (!studentMap[key]) {
        studentMap[key] = {
          nama: a.namaSiswa,
          nisn: a.nisn,
          kelas: a.kelas,
          count: 0,
          goldCount: 0,
          medals: []
        };
      }
      studentMap[key].count++;
      if (a.juara.includes('Juara 1') || a.juara.includes('Emas')) {
        studentMap[key].goldCount++;
        studentMap[key].medals.push('Emas');
      } else if (a.juara.includes('Juara 2') || a.juara.includes('Perak')) {
        studentMap[key].medals.push('Perak');
      } else if (a.juara.includes('Juara 3') || a.juara.includes('Perunggu')) {
        studentMap[key].medals.push('Perunggu');
      }
    });

    const leaderboard = Object.values(studentMap)
      .sort((a, b) => b.count - a.count || b.goldCount - a.goldCount)
      .slice(0, 5);

    // Latest achievements
    const latest = [...achievements]
      .sort((a, b) => new Date(b.tanggalPencapaian).getTime() - new Date(a.tanggalPencapaian).getTime())
      .slice(0, 5);

    return {
      total,
      currentYearCount,
      nationalAndIntl,
      uniqueStudents,
      tingkatCounts,
      bidangCounts,
      yearCounts,
      leaderboard,
      latest
    };
  }, [achievements, schoolProfile.tahunAjaranAktif]);

  return (
    <div className="space-y-6">
      {/* Real-Time Google Spreadsheet & Drive Multi-User Sync Banner */}
      {appsScriptUrl ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4 text-emerald-100" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900">
                  Sinkronisasi Otomatis Google Spreadsheet & Drive Aktif
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/60 hidden sm:inline-block">
                  Multi-User Real-Time
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Data di aplikasi dan Google Spreadsheet selalu sama. Jika admin lain menginput data atau foto pada waktu bersamaan, layar Anda otomatis tersinkronisasi.
                {lastSyncTime && (
                  <span className="text-emerald-800 font-semibold ml-1">
                    (Terakhir dicek: {lastSyncTime.toLocaleTimeString('id-ID')})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onManualSync && (
              <button
                onClick={onManualSync}
                disabled={isCloudSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer text-xs disabled:opacity-50"
                title="Periksa pembaruan data sekarang"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                <span>{isCloudSyncing ? 'Sinkron...' : 'Sinkronkan Sekarang'}</span>
              </button>
            )}
            {onOpenAppsScript && (
              <button
                onClick={onOpenAppsScript}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Buka Pengaturan Apps Script"
              >
                <FolderSync className="w-4 h-4 text-emerald-700" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-amber-950">
                Hubungkan ke Google Apps Script & Spreadsheet
              </p>
              <p className="text-amber-900/80 text-[11px] mt-0.5">
                Aktifkan sinkronisasi otomatis agar data tersimpan di Google Spreadsheet madrasah, foto tersimpan di Google Drive, dan dapat diakses bersamaan secara real-time.
              </p>
            </div>
          </div>
          {onOpenAppsScript && (
            <button
              onClick={onOpenAppsScript}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer whitespace-nowrap text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hubungkan Spreadsheet</span>
            </button>
          )}
        </div>
      )}

      {/* Guest Mode Informational Banner */}
      {!isAdmin && (
        <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                Mode Publik / Pengunjung — Ringkasan Real-Time Terbuka
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Anda dapat melihat seluruh statistik capaian, grafik sebaran, dan leaderboard prestasi siswa madrasah di bawah ini. Untuk menginput data prestasi baru, silakan masuk sebagai admin.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login Admin</span>
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-md p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-medium mb-3 backdrop-blur-sm border border-emerald-600/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Prestasi Madrasah (PUSPRESMA) · Jenjang {schoolProfile.jenjang}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 text-balance">
            Rekapitulasi Prestasi Siswa Madrasah
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            Sistem manajemen portofolio dan pendataan prestasi akademik, sains riset, keagamaan, olahraga, dan seni madrasah secara real-time untuk arsip dan akreditasi sekolah.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <button
                onClick={onOpenInput}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-emerald-900 text-sm font-semibold hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                Input Prestasi Siswa
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-emerald-900 text-sm font-semibold hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-4 h-4 text-emerald-700" />
                Login Admin untuk Input Data
              </button>
            )}
            <button
              onClick={() => onNavigateToData()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700/70 hover:bg-emerald-700 text-white text-sm font-medium transition-colors border border-emerald-500/40 cursor-pointer whitespace-nowrap"
            >
              <span>Eksplor Data Prestasi</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenPrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-800/70 hover:bg-teal-800 text-teal-100 text-sm font-medium transition-colors border border-teal-600/30 cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Cetak Rekap PDF
            </button>
          </div>
        </div>

        {/* Decorative background glow & emblem watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden lg:block overflow-hidden">
          <div className="w-96 h-96 rounded-full bg-emerald-400 blur-3xl -mr-20 -mt-20"></div>
        </div>
      </div>

      {/* 4 Real-time KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Prestasi */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Prestasi
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {stats.total}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Seluruh kejuaraan terverifikasi
            </p>
          </div>
        </div>

        {/* Card 2: Nasional & Internasional */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nasional & Global
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {stats.nationalAndIntl}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.tingkatCounts.Internasional} Internasional · {stats.tingkatCounts.Nasional} Nasional
            </p>
          </div>
        </div>

        {/* Card 3: Siswa Berprestasi */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Siswa Berprestasi
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {stats.uniqueStudents}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Peserta didik peraih medali & piala
            </p>
          </div>
        </div>

        {/* Card 4: Tahun Ajaran Berjalan */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tahun {schoolProfile.tahunAjaranAktif}
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {stats.currentYearCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pencapaian periode tahun ajaran aktif
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Breakdown & Quick Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Breakdown Tingkat Lomba & Tahun Ajaran (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Distribusi Tingkat Lomba */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Distribusi Tingkat Kejuaraan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sebaran prestasi dari tingkat kecamatan hingga kancah internasional
                </p>
              </div>
              <button 
                onClick={() => onNavigateToData()} 
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Data</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {(
                [
                  { label: 'Internasional', key: 'Internasional', color: 'bg-indigo-600', light: 'bg-indigo-50 text-indigo-700' },
                  { label: 'Nasional', key: 'Nasional', color: 'bg-emerald-600', light: 'bg-emerald-50 text-emerald-700' },
                  { label: 'Provinsi', key: 'Provinsi', color: 'bg-teal-600', light: 'bg-teal-50 text-teal-700' },
                  { label: 'Kabupaten / Kota', key: 'Kabupaten/Kota', color: 'bg-amber-600', light: 'bg-amber-50 text-amber-700' },
                  { label: 'Kecamatan / Wilayah', key: 'Kecamatan', color: 'bg-slate-600', light: 'bg-slate-50 text-slate-700' },
                ] as const
              ).map((tier) => {
                const count = stats.tingkatCounts[tier.key as TingkatLomba] || 0;
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={tier.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{tier.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 tabular-nums">{percentage}%</span>
                        <span className="font-bold text-slate-900 tabular-nums px-2 py-0.5 rounded bg-slate-100">
                          {count} Kejuaraan
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${tier.color} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Filter Shortcut by Tahun Ajaran */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Rekapitulasi Cepat per Tahun Ajaran:
                </span>
                <span className="text-slate-400 font-normal">Klik untuk filter</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.yearCounts).map(([year, count]) => (
                  <button
                    key={year}
                    onClick={() => onNavigateToData(year)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 transition-colors text-xs text-slate-700 cursor-pointer"
                  >
                    <span className="font-medium">T.A {year}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-800 font-bold tabular-nums">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Distribusi Bidang Prestasi */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Rekapitulasi Berdasarkan Bidang & Kategori
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Klasifikasi bidang pengembangan potensi santri dan siswa madrasah
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(stats.bidangCounts).map(([bidang, count]) => (
                <div 
                  key={bidang}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="pr-2">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {bidang}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {Math.round((count / (stats.total || 1)) * 100)}% dari total
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-800 tabular-nums shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard & Latest Prestasi */}
        <div className="space-y-6">
          {/* Leaderboard Bintang Prestasi */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Bintang Prestasi Siswa
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Siswa dengan perolehan piala dan medali terbanyak
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {stats.leaderboard.map((student, idx) => (
                <div 
                  key={student.nisn || student.nama}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx === 0 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : idx === 1 
                      ? 'bg-slate-200 text-slate-800' 
                      : idx === 2 
                      ? 'bg-amber-800/10 text-amber-900' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {student.nama}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>NISN: {student.nisn}</span>
                      <span>·</span>
                      <span>{student.kelas}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
                      {student.count} Prestasi
                    </span>
                    {student.goldCount > 0 ? (
                      <p className="text-[10px] text-amber-600 font-semibold tabular-nums">
                        {student.goldCount} Juara 1 / Emas
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-medium">
                        Terverifikasi
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prestasi Terkini & Akses Bukti */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Pencapaian Terbaru
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Data prestasi teranyar yang tercatat
                </p>
              </div>
              <button 
                onClick={() => onNavigateToData()} 
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                Semua
              </button>
            </div>

            <div className="space-y-3">
              {stats.latest.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onViewDetail(item)}
                  className="p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        {item.tingkatLomba} · {item.juara}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors mt-0.5">
                        {item.namaLomba}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">{item.namaSiswa}</span>
                        <span>·</span>
                        <span>{formatIndonesianDate(item.tanggalPencapaian)}</span>
                      </div>
                    </div>

                    {/* Thumbnail preview icons */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {item.piagamUrl && (
                        <span 
                          title="Piagam Terlampir" 
                          className="w-6 h-6 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-[10px]"
                        >
                          <FileText className="w-3 h-3" />
                        </span>
                      )}
                      <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Eye className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
