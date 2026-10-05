import React, { useState, useRef } from 'react';
import { SchoolProfile, StudentAchievement, JenjangMadrasah } from '../types';
import { 
  X, 
  Building2, 
  Save, 
  Upload, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle,
  GraduationCap,
  Layers,
  Plus,
  Trash2,
  Sparkles,
  Info,
  SlidersHorizontal,
  FolderArchive
} from 'lucide-react';
import { compressImageFile } from '../utils/storage';
import { 
  DEFAULT_CLASSES_MI, 
  DEFAULT_CLASSES_MTS, 
  DEFAULT_CLASSES_MA, 
  DEFAULT_CLASSES_ALL,
  getAvailableClassesForProfile 
} from '../data/initialData';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  onSaveProfile: (profile: SchoolProfile) => void;
  achievements: StudentAchievement[];
  onImportAchievements: (data: StudentAchievement[]) => void;
  onResetData: () => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  achievements,
  onImportAchievements,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'classes' | 'backup'>('classes');
  const [formData, setFormData] = useState<SchoolProfile>(() => {
    const initialClasses = profile.daftarKelas && profile.daftarKelas.length > 0
      ? profile.daftarKelas
      : getAvailableClassesForProfile(profile, achievements);
    return {
      ...profile,
      daftarKelas: initialClasses
    };
  });
  
  const [newClassInput, setNewClassInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddClass = () => {
    const trimmed = newClassInput.trim();
    if (!trimmed) return;
    const currentClasses = formData.daftarKelas || [];
    if (currentClasses.includes(trimmed)) {
      alert(`Kelas "${trimmed}" sudah ada di dalam daftar.`);
      return;
    }
    setFormData({
      ...formData,
      daftarKelas: [...currentClasses, trimmed]
    });
    setNewClassInput('');
  };

  const handleRemoveClass = (className: string) => {
    const currentClasses = formData.daftarKelas || [];
    setFormData({
      ...formData,
      daftarKelas: currentClasses.filter(c => c !== className)
    });
  };

  const handleApplyPreset = (jenjang: JenjangMadrasah) => {
    let preset: string[] = [];
    if (jenjang === 'MI') preset = DEFAULT_CLASSES_MI;
    else if (jenjang === 'MTs') preset = DEFAULT_CLASSES_MTS;
    else if (jenjang === 'MA') preset = DEFAULT_CLASSES_MA;
    else preset = DEFAULT_CLASSES_ALL;

    setFormData({
      ...formData,
      jenjang,
      daftarKelas: [...preset]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  const handleBackupJSON = () => {
    const backupData = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      schoolProfile: formData,
      achievements: achievements,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_PUSPRESMA_${formData.namaMadrasah.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.schoolProfile) {
          setFormData(parsed.schoolProfile);
          onSaveProfile(parsed.schoolProfile);
        }
        if (Array.isArray(parsed.achievements)) {
          onImportAchievements(parsed.achievements);
          alert(`Berhasil memulihkan ${parsed.achievements.length} data prestasi dari berkas cadangan!`);
          onClose();
        } else {
          alert('Format data cadangan tidak sesuai.');
        }
      } catch (err) {
        console.error(err);
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const compressed = await compressImageFile(file, 400, 0.9);
      setFormData((prev) => ({ ...prev, logoUrl: compressed }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-200 shrink-0">
              <Building2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Pengaturan Madrasah & Kelas</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 border border-emerald-500/40">
                  MI · MTs · MA
                </span>
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Konfigurasi jenjang sekolah, daftar kelas/rombel, profil lembaga, dan arsip data
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
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'classes'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pengaturan Kelas & Jenjang</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {formData.daftarKelas?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Profil & Kop Surat
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            Cadangan & Backup
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: PENGATURAN KELAS & JENJANG */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              {/* Highlight Jenjang */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    Pilih Jenjang Utama Madrasah
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Aplikasi ini dirancang fleksibel untuk semua jenjang pendidikan madrasah, mulai dari MI, MTs, hingga MA.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { 
                      id: 'MI', 
                      name: 'MI', 
                      fullName: 'Madrasah Ibtidaiyah', 
                      desc: 'Kelas 1 s.d. 6 (Tingkat Dasar)', 
                      icon: '🎒' 
                    },
                    { 
                      id: 'MTs', 
                      name: 'MTs', 
                      fullName: 'Madrasah Tsanawiyah', 
                      desc: 'Kelas VII, VIII, IX (Menengah Pertama)', 
                      icon: '📚' 
                    },
                    { 
                      id: 'MA', 
                      name: 'MA', 
                      fullName: 'Madrasah Aliyah', 
                      desc: 'Kelas X, XI, XII (Menengah Atas)', 
                      icon: '🎓' 
                    },
                    { 
                      id: 'MI, MTs & MA (Semua Jenjang / Terpadu)', 
                      name: 'Semua Jenjang', 
                      fullName: 'Kompleks / Terpadu', 
                      desc: 'Gabungan MI + MTs + MA', 
                      icon: '🏛️' 
                    },
                  ].map((j) => {
                    const isSelected = formData.jenjang === j.id;
                    return (
                      <div
                        key={j.id}
                        onClick={() => {
                          setFormData({ ...formData, jenjang: j.id as JenjangMadrasah });
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-600/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{j.icon}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs">
                          {j.name} <span className="font-normal text-slate-500">({j.fullName})</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {j.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Template generator buttons */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      Terapkan Template Cepat Berdasarkan Jenjang
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Ganti daftar kelas dengan format standar jenjang madrasah dalam satu klik:
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('MI')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 font-semibold text-slate-700 hover:text-emerald-800 text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🎒</span>
                    <span>Terapkan MI (Kelas 1 - 6)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('MTs')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 font-semibold text-slate-700 hover:text-emerald-800 text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📚</span>
                    <span>Terapkan MTs (Kelas VII - IX)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('MA')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 font-semibold text-slate-700 hover:text-emerald-800 text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🎓</span>
                    <span>Terapkan MA (Kelas X - XII)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('MI, MTs & MA (Semua Jenjang / Terpadu)')}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 font-semibold text-slate-700 hover:text-emerald-800 text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🏛️</span>
                    <span>Gabungan Semua Jenjang (MI s.d. MA)</span>
                  </button>
                </div>
              </div>

              {/* Class List Chips & Custom Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Daftar Kelas / Rombel Aktif ({formData.daftarKelas?.length || 0} Kelas)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Kelas-kelas ini akan otomatis muncul pada dropdown input prestasi siswa dan filter pencarian.
                    </p>
                  </div>
                  {formData.daftarKelas && formData.daftarKelas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, daftarKelas: [] })}
                      className="text-red-600 hover:text-red-700 font-semibold text-[11px] cursor-pointer"
                    >
                      Kosongkan Daftar
                    </button>
                  )}
                </div>

                {/* Input Add New Class */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ketik nama kelas baru (misal: Kelas 1-A, VII-Unggulan, X-Riset, XII-Tahfidz)..."
                    value={newClassInput}
                    onChange={(e) => setNewClassInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddClass();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddClass}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Kelas</span>
                  </button>
                </div>

                {/* Chips Container */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white min-h-[120px] max-h-60 overflow-y-auto">
                  {(!formData.daftarKelas || formData.daftarKelas.length === 0) ? (
                    <div className="text-center py-8 text-slate-400">
                      <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-xs">Belum ada kelas yang terdaftar.</p>
                      <p className="text-[11px] mt-0.5">
                        Gunakan tombol template di atas atau ketik nama kelas secara manual.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.daftarKelas.map((cls) => (
                        <span
                          key={cls}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold group shadow-2xs hover:bg-emerald-100 transition-colors"
                        >
                          <span>{cls}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveClass(cls)}
                            className="text-emerald-700 hover:text-red-600 p-0.5 rounded-full hover:bg-white/80 transition-colors cursor-pointer"
                            title={`Hapus ${cls}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200/80 flex items-start gap-2.5 text-xs text-teal-900">
                  <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Catatan:</strong> Guru atau admin juga tetap diperbolehkan mengetik nama kelas secara manual di formulir input prestasi jika terdapat kelas khusus di luar daftar ini.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL MADRASAH & KOP SURAT */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Logo & Nama Madrasah */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 block text-xs">
                    Logo / Lambang Resmi Madrasah
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-2">
                    Tampil di bagian kiri atas Kop Surat Laporan Cetak PDF & Lembar Portofolio
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                    >
                      Ganti Logo
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleLogoUpload(f);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Resmi Madrasah
                  </label>
                  <input
                    type="text"
                    value={formData.namaMadrasah}
                    onChange={(e) => setFormData({ ...formData, namaMadrasah: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nomor Statistik Madrasah (NSM)
                    </label>
                    <input
                      type="text"
                      value={formData.nsm}
                      onChange={(e) => setFormData({ ...formData, nsm: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NPSN
                    </label>
                    <input
                      type="text"
                      value={formData.npsn}
                      onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Madrasah
                  </label>
                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kota / Kabupaten
                    </label>
                    <input
                      type="text"
                      value={formData.kotaKabupaten}
                      onChange={(e) => setFormData({ ...formData, kotaKabupaten: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={formData.provinsi}
                      onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Status Lembaga
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Negeri' | 'Swasta' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Negeri">Negeri</option>
                      <option value="Swasta">Swasta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tahun Ajaran Aktif
                    </label>
                    <input
                      type="text"
                      value={formData.tahunAjaranAktif}
                      onChange={(e) => setFormData({ ...formData, tahunAjaranAktif: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Pejabat Penandatangan */}
                <div className="pt-3 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">Pejabat Pengesah Dokumen Laporan</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <span className="font-semibold text-slate-800 block">Kepala Madrasah</span>
                      <input
                        type="text"
                        placeholder="Nama Kepala Madrasah"
                        value={formData.kepalaMadrasah}
                        onChange={(e) => setFormData({ ...formData, kepalaMadrasah: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="NIP Kepala Madrasah"
                        value={formData.nipKepala}
                        onChange={(e) => setFormData({ ...formData, nipKepala: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <span className="font-semibold text-slate-800 block">Wakamad Kesiswaan</span>
                      <input
                        type="text"
                        placeholder="Nama Wakamad Kesiswaan"
                        value={formData.wakamadKesiswaan}
                        onChange={(e) => setFormData({ ...formData, wakamadKesiswaan: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="NIP Wakamad"
                        value={formData.nipWakamad}
                        onChange={(e) => setFormData({ ...formData, nipWakamad: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CADANGAN & BACKUP DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Pencadangan Berkas JSON</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Unduh seluruh konfigurasi profil madrasah, daftar kelas, dan seluruh riwayat prestasi siswa sebagai cadangan aman di komputer Anda.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleBackupJSON}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Cadangan JSON ({achievements.length} Prestasi)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pulihkan dari Berkas JSON</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleRestoreJSON}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
                <h4 className="font-bold text-red-900 text-xs">Reset ke Data Awal Percontohan</h4>
                <p className="text-[11px] text-red-800 leading-relaxed">
                  Tindakan ini akan mengembalikan data prestasi ke contoh bawaan sistem PUSPRESMA.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke percontohan awal madrasah?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-700 font-semibold text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Data Demo Awal</span>
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Jenjang: <strong>{formData.jenjang}</strong> ({formData.daftarKelas?.length || 0} kelas aktif)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer transition-colors"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-200" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
