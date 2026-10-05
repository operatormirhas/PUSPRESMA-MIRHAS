import React, { useState } from 'react';
import { StudentAchievement } from '../types';
import { 
  X, 
  Printer, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Award, 
  Calendar, 
  User, 
  Building, 
  Maximize2 
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/storage';

interface DetailModalProps {
  item: StudentAchievement | null;
  onClose: () => void;
  isAdmin: boolean;
  onEdit: (item: StudentAchievement) => void;
  onDelete: (id: string) => void;
  onVerify: (id: string, status: 'Terverifikasi' | 'Menunggu Verifikasi') => void;
  onPrintSingle: (item: StudentAchievement) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
  onVerify,
  onPrintSingle,
}) => {
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Tingkat {item.tingkatLomba}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                T.A {item.tahunAjaran}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {item.namaLomba}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Capaian Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  Capaian Peringkat
                </p>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {item.juara}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {item.bidangPrestasi} ({item.jenisPrestasi})
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">Tingkat Kejuaraan:</span>
              <div className="text-base font-extrabold text-emerald-800">
                {item.tingkatLomba}
              </div>
            </div>
          </div>

          {/* Grid Informasi Siswa & Perlombaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Box 1: Data Siswa */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                Data Siswa
              </h4>
              <div className="space-y-1.5 pt-1">
                <div>
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <p className="font-bold text-slate-900">{item.namaSiswa}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">NISN:</span>
                    <p className="font-mono tabular-nums font-semibold text-slate-800">{item.nisn}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Kelas:</span>
                    <p className="font-semibold text-slate-800">{item.kelas}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Gender:</span>
                    <p className="font-semibold text-slate-800">{item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Detail Event */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                Penyelenggara & Waktu
              </h4>
              <div className="space-y-1.5 pt-1">
                <div>
                  <span className="text-slate-500">Lembaga Penyelenggara:</span>
                  <p className="font-bold text-slate-900">{item.penyelenggara}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Tanggal Pencapaian:</span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatIndonesianDate(item.tanggalPencapaian)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Guru Pembimbing:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{item.guruPembimbing || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deskripsi / Keterangan */}
          {item.keterangan && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30">
              <span className="font-semibold text-slate-600">Deskripsi Karya / Catatan Penghargaan:</span>
              <p className="text-slate-800 mt-1 leading-relaxed italic">
                "{item.keterangan}"
              </p>
            </div>
          )}

          {/* LAMPIRAN BERKAS DIGITAL: FOTO KEGIATAN & PIAGAM PRESTASI */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              Lampiran Dokumen Bukti Portofolio
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foto Kegiatan */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">
                    Foto Dokumentasi Kegiatan
                  </span>
                  {item.fotoKegiatanUrl && (
                    <button
                      onClick={() => setZoomedImage({ url: item.fotoKegiatanUrl!, title: 'Foto Kegiatan' })}
                      className="text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      Perbesar
                    </button>
                  )}
                </div>
                {item.fotoKegiatanUrl ? (
                  <div 
                    onClick={() => setZoomedImage({ url: item.fotoKegiatanUrl!, title: 'Foto Kegiatan' })}
                    className="h-44 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer group"
                  >
                    <img
                      src={item.fotoKegiatanUrl}
                      alt="Dokumentasi Kegiatan"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="h-44 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-center p-4">
                    Belum ada foto dokumentasi diunggah
                  </div>
                )}
              </div>

              {/* Piagam Sertifikat */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">
                    Piagam Penghargaan / Sertifikat
                  </span>
                  {item.piagamUrl && (
                    <button
                      onClick={() => setZoomedImage({ url: item.piagamUrl!, title: 'Piagam Sertifikat' })}
                      className="text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      Perbesar
                    </button>
                  )}
                </div>
                {item.piagamUrl ? (
                  <div 
                    onClick={() => setZoomedImage({ url: item.piagamUrl!, title: 'Piagam Sertifikat' })}
                    className="h-44 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer group"
                  >
                    <img
                      src={item.piagamUrl}
                      alt="Piagam Sertifikat"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="h-44 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-center p-4">
                    Belum ada piagam sertifikat diunggah
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {item.statusVerifikasi === 'Terverifikasi' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Terverifikasi Madrasah
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Menunggu Verifikasi
              </span>
            )}

            {isAdmin && (
              <button
                onClick={() =>
                  onVerify(
                    item.id,
                    item.statusVerifikasi === 'Terverifikasi' ? 'Menunggu Verifikasi' : 'Terverifikasi'
                  )
                }
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                {item.statusVerifikasi === 'Terverifikasi' ? 'Batalkan Verifikasi' : 'Setujui Verifikasi'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintSingle(item)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Portofolio Siswa
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => onEdit(item)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus prestasi "${item.namaLomba}"?`)) {
                      onDelete(item.id);
                      onClose();
                    }
                  }}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus Prestasi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox zoomed image */}
      {zoomedImage && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedImage.url}
              alt={zoomedImage.title}
              className="max-h-[82vh] max-w-full object-contain rounded shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <p className="text-white text-xs mt-3 font-semibold">{zoomedImage.title}</p>
          </div>
        </div>
      )}
    </div>
  );
};
