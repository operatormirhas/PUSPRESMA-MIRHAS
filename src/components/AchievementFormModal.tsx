import React, { useState, useEffect, useRef } from 'react';
import { 
  StudentAchievement, 
  SchoolProfile, 
  TingkatLomba, 
  JenisPrestasi, 
  BidangPrestasi, 
  PeringkatJuara 
} from '../types';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Trash2, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  TAHUN_AJARAN_OPTIONS, 
  TINGKAT_LOMBA_OPTIONS, 
  BIDANG_PRESTASI_OPTIONS, 
  JUARA_OPTIONS, 
  KELAS_OPTIONS,
  getAvailableClassesForProfile 
} from '../data/initialData';
import { compressImageFile } from '../utils/storage';
import { saveAchievementToGAS } from '../utils/appsScript';

interface AchievementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: StudentAchievement) => void;
  initialData?: StudentAchievement | null;
  schoolProfile: SchoolProfile;
  appsScriptUrl?: string;
}

export const AchievementFormModal: React.FC<AchievementFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  schoolProfile,
  appsScriptUrl,
}) => {
  const availableClasses = React.useMemo(() => {
    return getAvailableClassesForProfile(schoolProfile, initialData ? [initialData] : []);
  }, [schoolProfile, initialData]);

  const defaultClass = availableClasses[0] || '1-A';

  const [formData, setFormData] = useState<Partial<StudentAchievement>>({
    namaSiswa: '',
    nisn: '',
    kelas: defaultClass,
    jenisKelamin: 'L',
    tahunAjaran: schoolProfile.tahunAjaranAktif || '2026/2027',
    namaLomba: '',
    jenisPrestasi: 'Akademik',
    bidangPrestasi: 'Sains & Riset (KSM / MYRES)',
    tingkatLomba: 'Nasional',
    juara: 'Juara 1',
    penyelenggara: '',
    tanggalPencapaian: new Date().toISOString().split('T')[0],
    guruPembimbing: '',
    keterangan: '',
    fotoKegiatanUrl: '',
    piagamUrl: '',
    statusVerifikasi: 'Terverifikasi',
  });

  const [isCustomKelas, setIsCustomKelas] = useState(false);
  const [customKelasValue, setCustomKelasValue] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCompressingFoto, setIsCompressingFoto] = useState(false);
  const [isCompressingPiagam, setIsCompressingPiagam] = useState(false);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const piagamInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      const isKnown = availableClasses.includes(initialData.kelas);
      if (!isKnown && initialData.kelas) {
        setIsCustomKelas(true);
        setCustomKelasValue(initialData.kelas);
      } else {
        setIsCustomKelas(false);
        setCustomKelasValue('');
      }
    } else {
      setFormData({
        namaSiswa: '',
        nisn: '',
        kelas: availableClasses[0] || '1-A',
        jenisKelamin: 'L',
        tahunAjaran: schoolProfile.tahunAjaranAktif || '2026/2027',
        namaLomba: '',
        jenisPrestasi: 'Akademik',
        bidangPrestasi: 'Sains & Riset (KSM / MYRES)',
        tingkatLomba: 'Nasional',
        juara: 'Juara 1',
        penyelenggara: '',
        tanggalPencapaian: new Date().toISOString().split('T')[0],
        guruPembimbing: '',
        keterangan: '',
        fotoKegiatanUrl: '',
        piagamUrl: '',
        statusVerifikasi: 'Terverifikasi',
      });
      setIsCustomKelas(false);
      setCustomKelasValue('');
    }
    setErrors({});
  }, [initialData, isOpen, schoolProfile.tahunAjaranAktif, availableClasses]);

  if (!isOpen) return null;

  const handleTingkatOrJuaraChange = (
    field: 'tingkatLomba' | 'juara',
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (
    file: File,
    type: 'foto' | 'piagam'
  ) => {
    try {
      if (type === 'foto') setIsCompressingFoto(true);
      if (type === 'piagam') setIsCompressingPiagam(true);

      const compressedUrl = await compressImageFile(file, 1280, 0.82);

      if (type === 'foto') {
        setFormData((prev) => ({ ...prev, fotoKegiatanUrl: compressedUrl }));
      } else {
        setFormData((prev) => ({ ...prev, piagamUrl: compressedUrl }));
      }
    } catch (err) {
      console.error('Gagal memproses file upload:', err);
      alert('Gagal memproses file. Silakan coba file gambar JPG/PNG lain.');
    } finally {
      if (type === 'foto') setIsCompressingFoto(false);
      if (type === 'piagam') setIsCompressingPiagam(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.namaSiswa?.trim()) {
      errs.namaSiswa = 'Nama siswa wajib diisi';
    }

    if (!formData.nisn?.trim()) {
      errs.nisn = 'NISN siswa wajib diisi';
    } else if (!/^\d{8,12}$/.test(formData.nisn.trim())) {
      errs.nisn = 'NISN harus berupa 8-12 digit angka';
    }

    if (!formData.namaLomba?.trim()) {
      errs.namaLomba = 'Nama kejuaraan / lomba wajib diisi';
    }

    if (!formData.penyelenggara?.trim()) {
      errs.penyelenggara = 'Lembaga penyelenggara wajib diisi';
    }

    if (!formData.tanggalPencapaian) {
      errs.tanggalPencapaian = 'Tanggal pencapaian wajib diisi';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let finalFotoUrl = formData.fotoKegiatanUrl || '';
    let finalPiagamUrl = formData.piagamUrl || '';

    const recordId = initialData?.id || `ach-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (appsScriptUrl?.trim()) {
      setIsUploadingToCloud(true);
      try {
        const gasResult = await saveAchievementToGAS(appsScriptUrl.trim(), {
          id: recordId,
          namaSiswa: formData.namaSiswa!.trim(),
          nisn: formData.nisn!.trim(),
          kelas: formData.kelas || 'VII-A',
          jenisKelamin: formData.jenisKelamin || 'L',
          tahunAjaran: formData.tahunAjaran || schoolProfile.tahunAjaranAktif || '2026/2027',
          namaLomba: formData.namaLomba!.trim(),
          jenisPrestasi: formData.jenisPrestasi as JenisPrestasi,
          bidangPrestasi: formData.bidangPrestasi as BidangPrestasi,
          tingkatLomba: formData.tingkatLomba as TingkatLomba,
          juara: formData.juara as PeringkatJuara,
          penyelenggara: formData.penyelenggara!.trim(),
          tanggalPencapaian: formData.tanggalPencapaian!,
          guruPembimbing: formData.guruPembimbing?.trim() || '',
          fotoKegiatanUrl: finalFotoUrl,
          piagamUrl: finalPiagamUrl,
          keterangan: formData.keterangan?.trim() || '',
          statusVerifikasi: formData.statusVerifikasi || 'Terverifikasi',
          createdAt: initialData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        if (gasResult.success) {
          if (gasResult.fotoKegiatanUrl) finalFotoUrl = gasResult.fotoKegiatanUrl;
          if (gasResult.piagamUrl) finalPiagamUrl = gasResult.piagamUrl;
        }
      } catch (err) {
        console.warn('Gagal simpan ke Apps Script, tetap simpan lokal:', err);
      } finally {
        setIsUploadingToCloud(false);
      }
    }

    const newRecord: StudentAchievement = {
      id: recordId,
      namaSiswa: formData.namaSiswa!.trim(),
      nisn: formData.nisn!.trim(),
      kelas: formData.kelas || 'VII-A',
      jenisKelamin: formData.jenisKelamin || 'L',
      tahunAjaran: formData.tahunAjaran || schoolProfile.tahunAjaranAktif || '2026/2027',
      namaLomba: formData.namaLomba!.trim(),
      jenisPrestasi: formData.jenisPrestasi as JenisPrestasi,
      bidangPrestasi: formData.bidangPrestasi as BidangPrestasi,
      tingkatLomba: formData.tingkatLomba as TingkatLomba,
      juara: formData.juara as PeringkatJuara,
      penyelenggara: formData.penyelenggara!.trim(),
      tanggalPencapaian: formData.tanggalPencapaian!,
      guruPembimbing: formData.guruPembimbing?.trim() || '',
      fotoKegiatanUrl: finalFotoUrl,
      piagamUrl: finalPiagamUrl,
      keterangan: formData.keterangan?.trim() || '',
      statusVerifikasi: formData.statusVerifikasi || 'Terverifikasi',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {initialData ? 'Edit Data Prestasi Siswa' : 'Input Data Prestasi Siswa Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Formulir pencatatan capaian kejuaraan, sertifikat piagam, dan dokumentasi foto siswa madrasah
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* SECTION 1: IDENTITAS SISWA */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">1</span>
              Identitas Siswa Madrasah
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Nama Siswa */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Azka Ramadhan"
                  value={formData.namaSiswa}
                  onChange={(e) => setFormData({ ...formData, namaSiswa: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs ${
                    errors.namaSiswa ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                  }`}
                />
                {errors.namaSiswa && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.namaSiswa}
                  </p>
                )}
              </div>

              {/* NISN */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NISN Siswa (10 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0081234567"
                  maxLength={12}
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs font-mono tabular-nums ${
                    errors.nisn ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                  }`}
                />
                {errors.nisn && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.nisn}
                  </p>
                )}
              </div>

              {/* Kelas */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Kelas / Rombel <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    Jenjang: {schoolProfile.jenjang}
                  </span>
                </div>
                
                {!isCustomKelas ? (
                  <div className="space-y-1.5">
                    <select
                      value={formData.kelas}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__MANUAL__') {
                          setIsCustomKelas(true);
                          setCustomKelasValue('');
                        } else {
                          setFormData({ ...formData, kelas: val });
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs cursor-pointer font-semibold text-slate-800"
                    >
                      {availableClasses.map((k) => (
                        <option key={k} value={k}>
                          {k.startsWith('Kelas') || k.startsWith('MI:') || k.startsWith('MTs:') || k.startsWith('MA:') ? k : `Kelas ${k}`}
                        </option>
                      ))}
                      <option value="__MANUAL__">✍️ + Tulis Kelas Manual / Kelas Lainnya...</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Ketik kelas siswa (misal: 6-A, VII-Tahfidz, X-Riset)..."
                        value={customKelasValue}
                        onChange={(e) => {
                          setCustomKelasValue(e.target.value);
                          setFormData({ ...formData, kelas: e.target.value });
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs font-semibold text-slate-900"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomKelas(false);
                          setFormData({ ...formData, kelas: availableClasses[0] || '1-A' });
                        }}
                        className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        title="Kembali ke daftar kelas pilihan"
                      >
                        Pilih Daftar
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Anda sedang mengetik kelas manual di luar daftar bawaan.
                    </p>
                  </div>
                )}
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <div className="flex items-center gap-3 py-2">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="L"
                      checked={formData.jenisKelamin === 'L'}
                      onChange={() => setFormData({ ...formData, jenisKelamin: 'L' })}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="P"
                      checked={formData.jenisKelamin === 'P'}
                      onChange={() => setFormData({ ...formData, jenisKelamin: 'P' })}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>

              {/* Tahun Ajaran */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tahunAjaran}
                  onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs cursor-pointer"
                >
                  {TAHUN_AJARAN_OPTIONS.map((ta) => (
                    <option key={ta} value={ta}>
                      {ta}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guru Pembimbing */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Guru Pembimbing / Pendamping
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Drs. H. Mulyadi, M.Pd."
                  value={formData.guruPembimbing}
                  onChange={(e) => setFormData({ ...formData, guruPembimbing: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DETAIL PRESTASI & KEJUARAAN */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">2</span>
              Detail Capaian & Kejuaraan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Nama Lomba */}
              <div className="sm:col-span-2 md:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lomba / Event Kejuaraan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kompetisi Sains Madrasah (KSM) Bidang Matematika Terintegrasi"
                  value={formData.namaLomba}
                  onChange={(e) => setFormData({ ...formData, namaLomba: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs ${
                    errors.namaLomba ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                  }`}
                />
                {errors.namaLomba && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.namaLomba}
                  </p>
                )}
              </div>

              {/* Tingkat Lomba */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tingkat Lomba <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tingkatLomba}
                  onChange={(e) => handleTingkatOrJuaraChange('tingkatLomba', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs cursor-pointer font-semibold text-slate-800"
                >
                  {TINGKAT_LOMBA_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Peringkat Juara */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peringkat / Capaian <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.juara}
                  onChange={(e) => handleTingkatOrJuaraChange('juara', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs cursor-pointer font-semibold text-emerald-800"
                >
                  {JUARA_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Pencapaian */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Pencapaian <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggalPencapaian}
                  onChange={(e) => setFormData({ ...formData, tanggalPencapaian: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs font-mono ${
                    errors.tanggalPencapaian ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                  }`}
                />
                {errors.tanggalPencapaian && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.tanggalPencapaian}
                  </p>
                )}
              </div>

              {/* Jenis Prestasi */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jenis Prestasi
                </label>
                <select
                  value={formData.jenisPrestasi}
                  onChange={(e) => setFormData({ ...formData, jenisPrestasi: e.target.value as JenisPrestasi })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs cursor-pointer"
                >
                  <option value="Akademik">Akademik</option>
                  <option value="Non-Akademik">Non-Akademik</option>
                </select>
              </div>

              {/* Bidang Prestasi */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bidang / Kategori
                </label>
                <select
                  value={formData.bidangPrestasi}
                  onChange={(e) => setFormData({ ...formData, bidangPrestasi: e.target.value as BidangPrestasi })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs cursor-pointer"
                >
                  {BIDANG_PRESTASI_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Penyelenggara */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lembaga Penyelenggara <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kemenag RI, Kemendikbud, LIPI"
                  value={formData.penyelenggara}
                  onChange={(e) => setFormData({ ...formData, penyelenggara: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs ${
                    errors.penyelenggara ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                  }`}
                />
                {errors.penyelenggara && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.penyelenggara}
                  </p>
                )}
              </div>

              {/* Keterangan */}
              <div className="sm:col-span-2 md:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Tambahan / Deskripsi Karya
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan mengenai judul karya riset, skor perolehan nilai, atau catatan penghargaan..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: UPLOAD FOTO KEGIATAN & UPLOAD PIAGAM PRESTASI */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">3</span>
              Lampiran Bukti Digital (Upload Foto Kegiatan & Piagam Prestasi)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* UPLOAD FOTO KEGIATAN */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      Upload Foto Kegiatan / Penyerahan
                    </span>
                    {formData.fotoKegiatanUrl && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Terunggah
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Unggah foto saat siswa memegang piala, medali, atau berada di panggung kejuaraan.
                  </p>
                </div>

                {formData.fotoKegiatanUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-900 h-40 flex items-center justify-center">
                    <img
                      src={formData.fotoKegiatanUrl}
                      alt="Foto Kegiatan"
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fotoInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, fotoKegiatanUrl: '' })}
                        className="p-1.5 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fotoInputRef.current?.click()}
                    className="h-36 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center p-4 cursor-pointer text-center"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="font-semibold text-slate-700 text-xs">
                      {isCompressingFoto ? 'Memproses berkas...' : 'Pilih Foto Kegiatan'}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, atau WebP (Otomatis dikompres)
                    </span>
                  </div>
                )}
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'foto');
                  }}
                />
              </div>

              {/* UPLOAD PIAGAM PRESTASI */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      Upload Piagam Prestasi / Sertifikat
                    </span>
                    {formData.piagamUrl && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Terunggah
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Unggah scan atau foto piagam penghargaan / sertifikat resmi untuk arsip akreditasi.
                  </p>
                </div>

                {formData.piagamUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-900 h-40 flex items-center justify-center">
                    <img
                      src={formData.piagamUrl}
                      alt="Piagam Sertifikat"
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => piagamInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                      >
                        Ganti Piagam
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, piagamUrl: '' })}
                        className="p-1.5 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                        title="Hapus Piagam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => piagamInputRef.current?.click()}
                    className="h-36 rounded-lg border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/30 transition-all flex flex-col items-center justify-center p-4 cursor-pointer text-center"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="font-semibold text-slate-700 text-xs">
                      {isCompressingPiagam ? 'Memproses berkas...' : 'Pilih Berkas Piagam'}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, atau PDF (Resolusi Tajam)
                    </span>
                  </div>
                )}
                <input
                  ref={piagamInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'piagam');
                  }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-slate-500 text-[11px]">
              Tingkat <strong>{formData.tingkatLomba}</strong> · Capaian: <strong className="text-emerald-800">{formData.juara}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isUploadingToCloud}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {isUploadingToCloud ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Menyimpan ke Drive & Sheets...</span>
                  </>
                ) : (
                  <span>{initialData ? 'Simpan Perubahan' : 'Simpan Data Prestasi'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
