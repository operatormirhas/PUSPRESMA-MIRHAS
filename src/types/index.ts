export type TingkatLomba = 
  | 'Kecamatan' 
  | 'Kabupaten/Kota' 
  | 'Provinsi' 
  | 'Nasional' 
  | 'Internasional';

export type JenisPrestasi = 
  | 'Akademik' 
  | 'Non-Akademik';

export type BidangPrestasi = 
  | 'Sains & Riset (KSM / MYRES)' 
  | 'Keagamaan & Tahfidz (MTQ / MQK)' 
  | 'Olahraga & Beladiri (POSKRAM / O2SN)' 
  | 'Seni & Budaya (FLS2N / Kaligrafi)' 
  | 'Bahasa & Sastra (Pidato / Debat)' 
  | 'Robotik & Teknologi Informasi' 
  | 'Pramuka & Kepemimpinan' 
  | 'Lainnya';

export type PeringkatJuara = 
  | 'Juara 1' 
  | 'Juara 2' 
  | 'Juara 3' 
  | 'Juara Harapan 1' 
  | 'Juara Harapan 2' 
  | 'Juara Harapan 3' 
  | 'Medali Emas' 
  | 'Medali Perak' 
  | 'Medali Perunggu' 
  | 'Finalis' 
  | 'Penghargaan Khusus';

export type StatusVerifikasi = 
  | 'Terverifikasi' 
  | 'Menunggu Verifikasi' 
  | 'Ditolak';

export interface StudentAchievement {
  id: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  jenisKelamin: 'L' | 'P';
  tahunAjaran: string; // e.g. "2026/2027", "2025/2026"
  namaLomba: string;
  jenisPrestasi: JenisPrestasi;
  bidangPrestasi: BidangPrestasi;
  tingkatLomba: TingkatLomba;
  juara: PeringkatJuara;
  penyelenggara: string;
  tanggalPencapaian: string; // YYYY-MM-DD
  guruPembimbing?: string;
  fotoKegiatanUrl?: string; // base64 or URL
  piagamUrl?: string; // base64 or URL
  keterangan?: string;
  statusVerifikasi: StatusVerifikasi;
  createdAt: string;
  updatedAt: string;
}

export type JenjangMadrasah = 'MI' | 'MTs' | 'MA' | 'MI, MTs & MA (Semua Jenjang / Terpadu)';

export interface SchoolProfile {
  namaMadrasah: string;
  jenjang: JenjangMadrasah;
  status: 'Negeri' | 'Swasta';
  nsm: string;
  npsn: string;
  alamat: string;
  kotaKabupaten: string;
  provinsi: string;
  kepalaMadrasah: string;
  nipKepala: string;
  wakamadKesiswaan: string;
  nipWakamad: string;
  akreditasi: string;
  tahunAjaranAktif: string;
  daftarKelas?: string[];
  logoUrl?: string;
}

export interface FilterState {
  searchQuery: string;
  tahunAjaran: string; // 'Semua' or specific like '2026/2027'
  tingkatLomba: string; // 'Semua' or specific
  jenisPrestasi: string; // 'Semua' or specific
  bidangPrestasi: string; // 'Semua' or specific
  kelas: string; // 'Semua' or specific
  statusVerifikasi: string; // 'Semua' or specific
}
