import React, { useState, useMemo } from 'react';
import { 
  StudentAchievement, 
  SchoolProfile, 
  FilterState, 
  TingkatLomba, 
  BidangPrestasi 
} from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  PlusCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle, 
  Clock, 
  LayoutList, 
  LayoutGrid, 
  X, 
  RotateCcw
} from 'lucide-react';
import { formatIndonesianDate, exportAchievementsToCSV } from '../utils/storage';
import { 
  TAHUN_AJARAN_OPTIONS, 
  TINGKAT_LOMBA_OPTIONS, 
  BIDANG_PRESTASI_OPTIONS, 
  KELAS_OPTIONS,
  getAvailableClassesForProfile 
} from '../data/initialData';

interface AchievementListViewProps {
  achievements: StudentAchievement[];
  schoolProfile: SchoolProfile;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onOpenInput: () => void;
  onOpenPrint: () => void;
  onViewDetail: (item: StudentAchievement) => void;
  onEdit: (item: StudentAchievement) => void;
  onDelete: (id: string) => void;
  onVerify: (id: string, status: 'Terverifikasi' | 'Menunggu Verifikasi') => void;
  onPrintSingle: (item: StudentAchievement) => void;
}

export const AchievementListView: React.FC<AchievementListViewProps> = ({
  achievements,
  schoolProfile,
  filterState,
  setFilterState,
  isAdmin,
  onOpenLogin,
  onOpenInput,
  onOpenPrint,
  onViewDetail,
  onEdit,
  onDelete,
  onVerify,
  onPrintSingle,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const availableClasses = useMemo(() => {
    return getAvailableClassesForProfile(schoolProfile, achievements);
  }, [schoolProfile, achievements]);
  const [activeMediaPreview, setActiveMediaPreview] = useState<{
    type: 'foto' | 'piagam';
    url: string;
    title: string;
    studentName: string;
  } | null>(null);

  // Available school years in data + default options
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>(TAHUN_AJARAN_OPTIONS);
    achievements.forEach(a => yearsSet.add(a.tahunAjaran));
    return Array.from(yearsSet).sort().reverse();
  }, [achievements]);

  // Filtered achievements logic
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      // Search query (Nama, NISN, Lomba, Penyelenggara)
      if (filterState.searchQuery.trim()) {
        const query = filterState.searchQuery.toLowerCase();
        const matchName = item.namaSiswa.toLowerCase().includes(query);
        const matchNisn = item.nisn.toLowerCase().includes(query);
        const matchLomba = item.namaLomba.toLowerCase().includes(query);
        const matchPenyelenggara = item.penyelenggara.toLowerCase().includes(query);
        const matchPembimbing = (item.guruPembimbing || '').toLowerCase().includes(query);
        if (!matchName && !matchNisn && !matchLomba && !matchPenyelenggara && !matchPembimbing) {
          return false;
        }
      }

      // Tahun Ajaran
      if (filterState.tahunAjaran !== 'Semua' && item.tahunAjaran !== filterState.tahunAjaran) {
        return false;
      }

      // Tingkat
      if (filterState.tingkatLomba !== 'Semua' && item.tingkatLomba !== filterState.tingkatLomba) {
        return false;
      }

      // Bidang
      if (filterState.bidangPrestasi !== 'Semua' && item.bidangPrestasi !== filterState.bidangPrestasi) {
        return false;
      }

      // Kelas
      if (filterState.kelas !== 'Semua' && !item.kelas.includes(filterState.kelas)) {
        return false;
      }

      // Status Verifikasi
      if (filterState.statusVerifikasi !== 'Semua' && item.statusVerifikasi !== filterState.statusVerifikasi) {
        return false;
      }

      return true;
    });
  }, [achievements, filterState]);

  const handleResetFilter = () => {
    setFilterState({
      searchQuery: '',
      tahunAjaran: 'Semua',
      tingkatLomba: 'Semua',
      jenisPrestasi: 'Semua',
      bidangPrestasi: 'Semua',
      kelas: 'Semua',
      statusVerifikasi: 'Semua',
    });
  };

  const isFilterActive = 
    filterState.searchQuery !== '' || 
    filterState.tahunAjaran !== 'Semua' || 
    filterState.tingkatLomba !== 'Semua' || 
    filterState.bidangPrestasi !== 'Semua' || 
    filterState.kelas !== 'Semua' || 
    filterState.statusVerifikasi !== 'Semua';

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Direktori & Arsip Prestasi Siswa
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 tabular-nums">
              {filteredAchievements.length} Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data rekapitulasi capaian kejuaraan siswa terverifikasi untuk arsip madrasah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/70">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Kartu / Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => exportAchievementsToCSV(filteredAchievements, schoolProfile.namaMadrasah)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            title="Download Spreadsheet Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onOpenPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer border border-emerald-200 whitespace-nowrap"
            title="Cetak format cetak PDF resmi dokumen madrasah"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>

          {isAdmin ? (
            <button
              onClick={onOpenInput}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Tambah Prestasi</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Tambah (Login Admin)</span>
            </button>
          )}
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        {/* FITUR PENCARIAN CEPAT SESUAI TAHUN AJARAN (SEGMENTED TABS) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Pencarian Cepat Sesuai Tahun Ajaran:
            </span>
            {isFilterActive && (
              <button
                onClick={handleResetFilter}
                className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Semua Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 border border-slate-200/80 rounded-lg">
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, tahunAjaran: 'Semua' }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterState.tahunAjaran === 'Semua'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              Semua Tahun Ajaran
            </button>
            {availableYears.map((year) => {
              const countInYear = achievements.filter((a) => a.tahunAjaran === year).length;
              return (
                <button
                  key={year}
                  onClick={() => setFilterState((prev) => ({ ...prev, tahunAjaran: year }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    filterState.tahunAjaran === year
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <span>T.A {year}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                    filterState.tahunAjaran === year
                      ? 'bg-emerald-900 text-emerald-100'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {countInYear}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Search Input & Secondary Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Live Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama siswa, NISN, lomba..."
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tingkat */}
          <div>
            <select
              value={filterState.tingkatLomba}
              onChange={(e) => setFilterState((prev) => ({ ...prev, tingkatLomba: e.target.value }))}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-slate-700 cursor-pointer"
            >
              <option value="Semua">Semua Tingkat Kejuaraan</option>
              {TINGKAT_LOMBA_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  Tingkat {t}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Bidang */}
          <div>
            <select
              value={filterState.bidangPrestasi}
              onChange={(e) => setFilterState((prev) => ({ ...prev, bidangPrestasi: e.target.value }))}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-slate-700 cursor-pointer truncate"
            >
              <option value="Semua">Semua Bidang Prestasi</option>
              {BIDANG_PRESTASI_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={filterState.kelas}
              onChange={(e) => setFilterState((prev) => ({ ...prev, kelas: e.target.value }))}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-slate-700 cursor-pointer font-medium"
            >
              <option value="Semua">Semua Kelas ({schoolProfile.jenjang})</option>
              {availableClasses.map((k) => (
                <option key={k} value={k}>
                  {k.startsWith('Kelas') || k.startsWith('MI:') || k.startsWith('MTs:') || k.startsWith('MA:') ? k : `Kelas ${k}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span>Menampilkan <strong>{filteredAchievements.length}</strong> dari {achievements.length} capaian</span>
            {filterState.tahunAjaran !== 'Semua' && (
              <>
                <span>·</span>
                <span className="font-semibold text-emerald-800">Tahun Ajaran: {filterState.tahunAjaran}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT: TABLE VIEW OR GRID VIEW */}
      {filteredAchievements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Tidak ada data prestasi yang cocok
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Coba sesuaikan kata kunci pencarian atau reset filter tahun ajaran untuk melihat seluruh arsip madrasah.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={handleResetFilter}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
            <button
              onClick={onOpenInput}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
            >
              + Tambah Prestasi Baru
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* HIGH-DENSITY ENTERPRISE TABLE */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Siswa & NISN</th>
                  <th className="py-3.5 px-4">Kejuaraan & Capaian</th>
                  <th className="py-3.5 px-4">Tingkat & Bidang</th>
                  <th className="py-3.5 px-4">T.A & Tanggal</th>
                  <th className="py-3.5 px-4 text-center">Bukti Lampiran</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAchievements.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center text-slate-400 tabular-nums font-mono">
                      {index + 1}
                    </td>

                    {/* Siswa & NISN */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer" onClick={() => onViewDetail(item)}>
                        {item.namaSiswa}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono tabular-nums font-medium text-slate-600">NISN: {item.nisn}</span>
                        <span>·</span>
                        <span className="font-medium text-emerald-800">{item.kelas}</span>
                      </div>
                    </td>

                    {/* Kejuaraan & Capaian */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate" title={item.namaLomba}>
                        {item.namaLomba}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                        <span className="font-bold text-emerald-700">{item.juara}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 truncate" title={item.penyelenggara}>
                          {item.penyelenggara}
                        </span>
                      </div>
                    </td>

                    {/* Tingkat & Bidang */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">
                        {item.tingkatLomba}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={item.bidangPrestasi}>
                        {item.bidangPrestasi}
                      </div>
                    </td>

                    {/* Tahun Ajaran & Tanggal */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        T.A {item.tahunAjaran}
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        {formatIndonesianDate(item.tanggalPencapaian)}
                      </div>
                    </td>

                    {/* Lampiran Piagam & Foto */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {item.piagamUrl ? (
                          <button
                            onClick={() =>
                              setActiveMediaPreview({
                                type: 'piagam',
                                url: item.piagamUrl!,
                                title: `Piagam: ${item.namaLomba}`,
                                studentName: item.namaSiswa,
                              })
                            }
                            className="p-1.5 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                            title="Lihat Piagam Sertifikat"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[10px]">-</span>
                        )}

                        {item.fotoKegiatanUrl ? (
                          <button
                            onClick={() =>
                              setActiveMediaPreview({
                                type: 'foto',
                                url: item.fotoKegiatanUrl!,
                                title: `Foto Kegiatan: ${item.namaLomba}`,
                                studentName: item.namaSiswa,
                              })
                            }
                            className="p-1.5 rounded-md bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            title="Lihat Dokumentasi Kegiatan"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[10px]">-</span>
                        )}
                      </div>
                    </td>

                    {/* Status Verifikasi */}
                    <td className="py-3 px-4 text-center">
                      {item.statusVerifikasi === 'Terverifikasi' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Terverifikasi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          onClick={() => onViewDetail(item)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Detail Prestasi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onPrintSingle(item)}
                          className="p-1.5 rounded hover:bg-emerald-50 text-emerald-700 transition-colors cursor-pointer"
                          title="Cetak Lembar Portofolio Siswa (PDF)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onEdit(item)}
                              className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                              title="Edit Data"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus prestasi "${item.namaLomba}" atas nama ${item.namaSiswa}?`)) {
                                  onDelete(item.id);
                                }
                              }}
                              className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                              title="Hapus Prestasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card visual banner if image or piagam exists */}
              <div 
                className="h-36 bg-slate-100 relative overflow-hidden cursor-pointer"
                onClick={() => onViewDetail(item)}
              >
                {item.fotoKegiatanUrl ? (
                  <img
                    src={item.fotoKegiatanUrl}
                    alt={item.namaLomba}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : item.piagamUrl ? (
                  <img
                    src={item.piagamUrl}
                    alt={item.namaLomba}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-800 to-teal-900 text-emerald-100 text-xs">
                    Dokumentasi Prestasi
                  </div>
                )}
                {/* Tingkat & Juara overlay ribbon */}
                <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                  {item.tingkatLomba} · {item.juara}
                </div>
                <div className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  T.A {item.tahunAjaran}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 
                    onClick={() => onViewDetail(item)}
                    className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-emerald-700 cursor-pointer"
                    title={item.namaLomba}
                  >
                    {item.namaLomba}
                  </h3>
                  <div className="text-xs text-slate-600 mt-2">
                    <p className="font-semibold text-slate-900">{item.namaSiswa}</p>
                    <p className="text-[11px] text-slate-500 font-mono">NISN: {item.nisn} · {item.kelas}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                    Penyelenggara: {item.penyelenggara}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.piagamUrl && (
                      <button
                        onClick={() =>
                          setActiveMediaPreview({
                            type: 'piagam',
                            url: item.piagamUrl!,
                            title: `Piagam: ${item.namaLomba}`,
                            studentName: item.namaSiswa,
                          })
                        }
                        className="p-1 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold flex items-center gap-1 border border-amber-200 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        Piagam
                      </button>
                    )}
                    {item.fotoKegiatanUrl && (
                      <button
                        onClick={() =>
                          setActiveMediaPreview({
                            type: 'foto',
                            url: item.fotoKegiatanUrl!,
                            title: `Foto Kegiatan: ${item.namaLomba}`,
                            studentName: item.namaSiswa,
                          })
                        }
                        className="p-1 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold flex items-center gap-1 border border-blue-200 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        Foto
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPrintSingle(item)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                      title="Cetak Arsip Portofolio Siswa"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onViewDetail(item)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      title="Lihat Detail"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit Data"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP LIGHTBOX MEDIA PREVIEW */}
      {activeMediaPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {activeMediaPreview.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Siswa: {activeMediaPreview.studentName}
                </p>
              </div>
              <button
                onClick={() => setActiveMediaPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Body */}
            <div className="p-4 flex items-center justify-center bg-slate-900 overflow-auto max-h-[70vh]">
              <img
                src={activeMediaPreview.url}
                alt={activeMediaPreview.title}
                className="max-h-[65vh] w-auto object-contain rounded shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Format: Berkas Digital Resolusi Penuh
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activeMediaPreview.url}
                  download={`Bukti_${activeMediaPreview.studentName.replace(/\s+/g, '_')}.jpg`}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                >
                  Unduh Berkas
                </a>
                <button
                  onClick={() => setActiveMediaPreview(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
