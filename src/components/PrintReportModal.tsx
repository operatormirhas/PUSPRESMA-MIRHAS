import React, { useState, useMemo } from 'react';
import { StudentAchievement, SchoolProfile } from '../types';
import { 
  Printer, 
  X, 
  Download, 
  Calendar, 
  Filter, 
  CheckCircle, 
  BookOpen, 
  UserCheck 
} from 'lucide-react';
import { formatIndonesianDate, exportAchievementsToCSV } from '../utils/storage';
import { TAHUN_AJARAN_OPTIONS, TINGKAT_LOMBA_OPTIONS, getAvailableClassesForProfile } from '../data/initialData';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: StudentAchievement[];
  schoolProfile: SchoolProfile;
  preselectedAchievement?: StudentAchievement | null;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  achievements,
  schoolProfile,
  preselectedAchievement,
}) => {
  const [printMode, setPrintMode] = useState<'rekap' | 'individual'>(
    preselectedAchievement ? 'individual' : 'rekap'
  );
  const [selectedYear, setSelectedYear] = useState<string>(schoolProfile.tahunAjaranAktif || 'Semua');
  const [selectedTingkat, setSelectedTingkat] = useState<string>('Semua');
  const [selectedKelas, setSelectedKelas] = useState<string>('Semua');
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>(
    preselectedAchievement?.id || achievements[0]?.id || ''
  );

  const availableClasses = useMemo(() => {
    return getAvailableClassesForProfile(schoolProfile, achievements);
  }, [schoolProfile, achievements]);

  const [nomorSurat, setNomorSurat] = useState(`B-${Math.floor(100 + Math.random() * 900)}/${schoolProfile.jenjang === 'MI' ? 'MI' : schoolProfile.jenjang === 'MA' ? 'MA' : 'MTs'}.10.05/PP.00.5/${new Date().getFullYear()}`);

  // Filtered dataset for print
  const printableList = useMemo(() => {
    return achievements.filter((item) => {
      if (selectedYear !== 'Semua' && item.tahunAjaran !== selectedYear) return false;
      if (selectedTingkat !== 'Semua' && item.tingkatLomba !== selectedTingkat) return false;
      if (selectedKelas !== 'Semua' && item.kelas !== selectedKelas && !item.kelas.includes(selectedKelas)) return false;
      return true;
    });
  }, [achievements, selectedYear, selectedTingkat, selectedKelas]);

  // Selected individual achievement for single print
  const selectedIndividual = useMemo(() => {
    return achievements.find((a) => a.id === selectedIndividualId) || achievements[0];
  }, [achievements, selectedIndividualId]);

  if (!isOpen) return null;

  const handleExecutePrint = () => {
    window.print();
  };

  const currentDateIndo = formatIndonesianDate(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container Dialog */}
      <div className="bg-white rounded-2xl max-w-5xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-700" />
              Cetak Dokumen Laporan Prestasi (Format Arsip PDF)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Siap cetak ke kertas A4 atau disimpan dalam format PDF berstandar resmi Kementerian Agama
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecutePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Filter Options Toolbar (Hidden during print) */}
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 no-print">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setPrintMode('rekap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                printMode === 'rekap' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Rekap Kolektif ({printableList.length})
            </button>
            <button
              onClick={() => setPrintMode('individual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                printMode === 'individual' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Lembar Individual Siswa
            </button>
          </div>

          {printMode === 'rekap' ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>T.A:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs cursor-pointer font-semibold"
                >
                  <option value="Semua">Semua Tahun Ajaran</option>
                  {TAHUN_AJARAN_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      T.A {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tingkat:</span>
                <select
                  value={selectedTingkat}
                  onChange={(e) => setSelectedTingkat(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs cursor-pointer font-semibold"
                >
                  <option value="Semua">Semua Tingkat</option>
                  {TINGKAT_LOMBA_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <span>Kelas:</span>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs cursor-pointer font-semibold"
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
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Pilih Siswa:</span>
              <select
                value={selectedIndividualId}
                onChange={(e) => setSelectedIndividualId(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs cursor-pointer font-semibold max-w-xs truncate"
              >
                {achievements.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.namaSiswa} ({item.kelas}) - {item.juara} {item.namaLomba.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* PRINTABLE DOCUMENT VIEWPORT */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="printable-document bg-white w-full max-w-4xl p-8 sm:p-10 shadow-md border border-slate-200 text-black font-sans leading-relaxed">
            {/* KOP SURAT RESMI KEMENTERIAN AGAMA */}
            <div className="text-center pb-3 border-b-2 border-black relative">
              <div className="flex items-center justify-between gap-4">
                {/* Logo Kemenag / Madrasah */}
                <div className="w-20 h-20 flex items-center justify-center shrink-0">
                  {schoolProfile.logoUrl ? (
                    <img
                      src={schoolProfile.logoUrl}
                      alt="Logo Madrasah"
                      className="max-h-18 max-w-18 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs">
                      LOGO
                    </div>
                  )}
                </div>

                {/* Kop Text */}
                <div className="flex-1 text-center">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-slate-800">
                    KEMENTERIAN AGAMA REPUBLIK INDONESIA
                  </h4>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-800">
                    KANTOR KEMENTERIAN AGAMA {schoolProfile.kotaKabupaten.toUpperCase()}
                  </h4>
                  <h2 className="text-base sm:text-lg uppercase font-extrabold tracking-tight text-black mt-0.5">
                    {schoolProfile.namaMadrasah}
                  </h2>
                  <p className="text-[11px] text-slate-700 leading-tight mt-0.5">
                    NSM: {schoolProfile.nsm} | NPSN: {schoolProfile.npsn} | Status: {schoolProfile.status} | Terakreditasi: {schoolProfile.akreditasi}
                  </p>
                  <p className="text-[10px] text-slate-600 leading-tight">
                    {schoolProfile.alamat}, {schoolProfile.kotaKabupaten}, {schoolProfile.provinsi}
                  </p>
                </div>

                <div className="w-20 hidden sm:block shrink-0"></div>
              </div>
              {/* Garis Ganda Kop Surat */}
              <div className="mt-3 border-b border-black"></div>
            </div>

            {/* DOKUMEN 1: REKAPITULASI PRESTASI KOLEKTIF */}
            {printMode === 'rekap' ? (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-extrabold tracking-wide uppercase underline">
                    LAPORAN REKAPITULASI PRESTASI SISWA
                  </h3>
                  <p className="text-xs text-slate-700 mt-1">
                    Nomor: {nomorSurat}
                  </p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    Jenjang: {schoolProfile.jenjang} · {selectedYear === 'Semua' ? 'Seluruh Tahun Ajaran' : `Tahun Ajaran ${selectedYear}`}
                    {selectedTingkat !== 'Semua' && ` · Tingkat ${selectedTingkat}`}
                    {selectedKelas !== 'Semua' && ` · Kelas ${selectedKelas}`}
                  </p>
                </div>

                {/* Ringkasan Rekap */}
                <div className="text-xs text-slate-800">
                  <p className="leading-relaxed">
                    Berdasarkan catatan buku induk prestasi siswa madrasah, berikut adalah data capaian kejuaraan dan penghargaan yang telah diraih oleh peserta didik {schoolProfile.namaMadrasah}:
                  </p>
                </div>

                {/* TABEL DATA REKAP RESMI */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10.5pt] border border-black">
                    <thead>
                      <tr className="bg-slate-100 text-black font-bold border-b border-black text-center text-[10pt]">
                        <th className="p-2 border-r border-black w-8">No</th>
                        <th className="p-2 border-r border-black w-24">NISN</th>
                        <th className="p-2 border-r border-black">Nama Siswa</th>
                        <th className="p-2 border-r border-black w-14">Kelas</th>
                        <th className="p-2 border-r border-black">Nama Kejuaraan / Lomba</th>
                        <th className="p-2 border-r border-black w-20">Capaian</th>
                        <th className="p-2 border-r border-black w-20">Tingkat</th>
                        <th className="p-2 border-r border-black">Penyelenggara</th>
                        <th className="p-2 w-20">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printableList.map((item, index) => (
                        <tr key={item.id} className="border-b border-black/70 hover:bg-slate-50 text-[10pt]">
                          <td className="p-2 border-r border-black text-center tabular-nums">
                            {index + 1}
                          </td>
                          <td className="p-2 border-r border-black font-mono tabular-nums text-center text-[9pt]">
                            {item.nisn}
                          </td>
                          <td className="p-2 border-r border-black font-semibold">
                            {item.namaSiswa}
                          </td>
                          <td className="p-2 border-r border-black text-center">
                            {item.kelas}
                          </td>
                          <td className="p-2 border-r border-black">
                            <div>{item.namaLomba}</div>
                            <div className="text-[9pt] text-slate-600 italic">{item.bidangPrestasi}</div>
                          </td>
                          <td className="p-2 border-r border-black font-bold text-center">
                            {item.juara}
                          </td>
                          <td className="p-2 border-r border-black text-center">
                            {item.tingkatLomba}
                          </td>
                          <td className="p-2 border-r border-black text-[9pt]">
                            {item.penyelenggara}
                          </td>
                          <td className="p-2 text-[9pt] tabular-nums whitespace-nowrap text-center">
                            {item.tanggalPencapaian}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Catatan statistik rekap */}
                <div className="text-[10pt] text-slate-700 pt-1">
                  <p>
                    Total Data: <strong>{printableList.length} prestasi</strong> tercatat dalam buku induk prestasi.
                  </p>
                </div>

                {/* LEMBAR PENGESAHAN TANDA TANGAN RESMI */}
                <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
                  <div>
                    <p className="text-slate-700">Mengetahui,</p>
                    <p className="font-bold text-slate-900 mt-0.5">Kepala {schoolProfile.namaMadrasah}</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Cap Madrasah]</span>
                    </div>
                    <p className="font-bold text-slate-900 underline text-sm">
                      {schoolProfile.kepalaMadrasah}
                    </p>
                    <p className="text-slate-600 text-[10px] font-mono mt-0.5">
                      NIP. {schoolProfile.nipKepala}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-700">
                      {schoolProfile.kotaKabupaten}, {currentDateIndo}
                    </p>
                    <p className="font-bold text-slate-900 mt-0.5">Wakamad Bidang Kesiswaan</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 italic">[Tanda Tangan]</span>
                    </div>
                    <p className="font-bold text-slate-900 underline text-sm">
                      {schoolProfile.wakamadKesiswaan}
                    </p>
                    <p className="text-slate-600 text-[10px] font-mono mt-0.5">
                      NIP. {schoolProfile.nipWakamad}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* DOKUMEN 2: LEMBAR PORTOFOLIO INDIVIDUAL SISWA */
              <div className="mt-6 space-y-5">
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-extrabold tracking-wide uppercase underline">
                    LEMBAR VERIFIKASI & PORTOFOLIO PRESTASI SISWA
                  </h3>
                  <p className="text-xs text-slate-700 mt-1">
                    Nomor Arsip: PUSPRESMA/{selectedIndividual.tahunAjaran.replace('/', '-')}/{selectedIndividual.nisn}
                  </p>
                </div>

                {/* Tabel Identitas Siswa */}
                <div className="border border-black p-3 bg-slate-50/50 text-xs">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="w-36 font-semibold py-1">Nama Siswa</td>
                        <td className="w-3 py-1">:</td>
                        <td className="font-bold text-sm text-slate-900 py-1">{selectedIndividual.namaSiswa}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">NISN</td>
                        <td className="py-1">:</td>
                        <td className="font-mono tabular-nums py-1">{selectedIndividual.nisn}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">Kelas & Jenis Kelamin</td>
                        <td className="py-1">:</td>
                        <td className="py-1">{selectedIndividual.kelas} ({selectedIndividual.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'})</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">Tahun Ajaran</td>
                        <td className="py-1">:</td>
                        <td className="py-1 font-semibold">T.A {selectedIndividual.tahunAjaran}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Detail Prestasi */}
                <div className="border border-black p-3 text-xs space-y-1.5">
                  <h4 className="font-bold text-slate-900 border-b border-black pb-1 uppercase tracking-wide">
                    Detail Capaian Kejuaraan
                  </h4>
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="w-36 font-semibold py-1">Nama Kejuaraan</td>
                        <td className="w-3 py-1">:</td>
                        <td className="font-bold text-slate-900 py-1">{selectedIndividual.namaLomba}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">Peringkat / Juara</td>
                        <td className="py-1">:</td>
                        <td className="font-bold text-emerald-800 text-sm py-1">{selectedIndividual.juara}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">Tingkat Kejuaraan</td>
                        <td className="py-1">:</td>
                        <td className="font-semibold py-1">{selectedIndividual.tingkatLomba}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">Bidang & Kategori</td>
                        <td className="py-1">:</td>
                        <td className="py-1">{selectedIndividual.bidangPrestasi} ({selectedIndividual.jenisPrestasi})</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">Lembaga Penyelenggara</td>
                        <td className="py-1">:</td>
                        <td className="py-1">{selectedIndividual.penyelenggara}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">Tanggal Pencapaian</td>
                        <td className="py-1">:</td>
                        <td className="py-1">{formatIndonesianDate(selectedIndividual.tanggalPencapaian)}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">Guru Pembimbing</td>
                        <td className="py-1">:</td>
                        <td className="py-1">{selectedIndividual.guruPembimbing || '-'}</td>
                      </tr>
                      {selectedIndividual.keterangan && (
                        <tr>
                          <td className="font-semibold py-1 align-top">Keterangan / Karya</td>
                          <td className="py-1 align-top">:</td>
                          <td className="py-1 italic text-slate-700">{selectedIndividual.keterangan}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* LAMPIRAN BUKTI DOKUMENTASI & PIAGAM */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-black border-b border-black pb-1">
                    Lampiran Berkas Bukti Digital
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Piagam Penghargaan */}
                    <div className="border border-black p-2 text-center">
                      <p className="font-bold text-[10px] uppercase mb-1">
                        Scan Piagam Penghargaan / Sertifikat
                      </p>
                      {selectedIndividual.piagamUrl ? (
                        <div className="h-48 bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200">
                          <img
                            src={selectedIndividual.piagamUrl}
                            alt="Piagam"
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="h-48 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs italic">
                          Piagam Belum Diunggah
                        </div>
                      )}
                    </div>

                    {/* Foto Dokumentasi */}
                    <div className="border border-black p-2 text-center">
                      <p className="font-bold text-[10px] uppercase mb-1">
                        Dokumentasi Foto Kegiatan Siswa
                      </p>
                      {selectedIndividual.fotoKegiatanUrl ? (
                        <div className="h-48 bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200">
                          <img
                            src={selectedIndividual.fotoKegiatanUrl}
                            alt="Foto Kegiatan"
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="h-48 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs italic">
                          Foto Dokumentasi Belum Diunggah
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lembar Tanda Tangan */}
                <div className="mt-8 pt-2 grid grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
                  <div>
                    <p className="text-slate-700">Mengetahui,</p>
                    <p className="font-bold text-slate-900 mt-0.5">Kepala {schoolProfile.namaMadrasah}</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Cap]</span>
                    </div>
                    <p className="font-bold text-slate-900 underline text-sm">
                      {schoolProfile.kepalaMadrasah}
                    </p>
                    <p className="text-slate-600 text-[10px] font-mono mt-0.5">
                      NIP. {schoolProfile.nipKepala}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-700">
                      {schoolProfile.kotaKabupaten}, {currentDateIndo}
                    </p>
                    <p className="font-bold text-slate-900 mt-0.5">Wakamad Kesiswaan / Verifikator</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 italic">[Tanda Tangan]</span>
                    </div>
                    <p className="font-bold text-slate-900 underline text-sm">
                      {schoolProfile.wakamadKesiswaan}
                    </p>
                    <p className="text-slate-600 text-[10px] font-mono mt-0.5">
                      NIP. {schoolProfile.nipWakamad}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
