import { StudentAchievement, SchoolProfile, JenjangMadrasah } from '../types';

export const DEFAULT_CLASSES_MI = [
  '1-A', '1-B', '1-C',
  '2-A', '2-B', '2-C',
  '3-A', '3-B', '3-C',
  '4-A', '4-B', '4-C',
  '5-A', '5-B', '5-C',
  '6-A', '6-B', '6-C'
];

export const DEFAULT_CLASSES_MTS = [
  'VII-A', 'VII-B', 'VII-C', 'VII-D',
  'VIII-A', 'VIII-B', 'VIII-C', 'VIII-D',
  'IX-A', 'IX-B', 'IX-C', 'IX-Tahfidz'
];

export const DEFAULT_CLASSES_MA = [
  'X-1', 'X-2', 'X-3', 'X-Keagamaan',
  'XI-MIPA 1', 'XI-MIPA 2', 'XI-IPS 1', 'XI-IPS 2', 'XI-Keagamaan',
  'XII-MIPA 1', 'XII-MIPA 2', 'XII-IPS', 'XII-Keagamaan'
];

export const DEFAULT_CLASSES_ALL = [
  ...DEFAULT_CLASSES_MI.map(k => `MI: ${k}`),
  ...DEFAULT_CLASSES_MTS.map(k => `MTs: ${k}`),
  ...DEFAULT_CLASSES_MA.map(k => `MA: ${k}`)
];

export function getClassesForJenjang(jenjang?: JenjangMadrasah): string[] {
  if (jenjang === 'MI') return DEFAULT_CLASSES_MI;
  if (jenjang === 'MA') return DEFAULT_CLASSES_MA;
  if (jenjang === 'MI, MTs & MA (Semua Jenjang / Terpadu)') return DEFAULT_CLASSES_ALL;
  return DEFAULT_CLASSES_MTS;
}

export function getAvailableClassesForProfile(profile?: SchoolProfile, achievements?: StudentAchievement[]): string[] {
  const baseClasses = profile?.daftarKelas && profile.daftarKelas.length > 0
    ? [...profile.daftarKelas]
    : getClassesForJenjang(profile?.jenjang);

  // If there are achievements with custom class names not in baseClasses, append them so they never get lost
  if (achievements && achievements.length > 0) {
    achievements.forEach(a => {
      if (a.kelas && !baseClasses.includes(a.kelas)) {
        baseClasses.push(a.kelas);
      }
    });
  }

  return baseClasses;
}

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  namaMadrasah: 'MADRASAH TSANAWIYAH NEGERI 1 KOTA ADIWIYATA',
  jenjang: 'MTs',
  status: 'Negeri',
  nsm: '121132730001',
  npsn: '20278910',
  alamat: 'Jl. Pemuda Pendidikan No. 45, Kecamatan Sukajadi',
  kotaKabupaten: 'Kota Bandung',
  provinsi: 'Jawa Barat',
  kepalaMadrasah: 'Dr. H. Ahmad Fauzi, M.Ag.',
  nipKepala: '19760512 200212 1 003',
  wakamadKesiswaan: 'Hj. Siti Nurkholisah, M.Pd.',
  nipWakamad: '19820817 200801 2 015',
  akreditasi: 'A (Unggul - 98)',
  tahunAjaranAktif: '2026/2027',
  daftarKelas: DEFAULT_CLASSES_MTS,
  logoUrl: '/src/assets/images/madrasah_logo_1790990198851.jpg'
};

export const INITIAL_ACHIEVEMENTS: StudentAchievement[] = [
  {
    id: 'ach-001',
    namaSiswa: 'Muhammad Azka Ramadhan',
    nisn: '0081234567',
    kelas: 'IX-A (Unggulan Sains)',
    jenisKelamin: 'L',
    tahunAjaran: '2026/2027',
    namaLomba: 'Kompetisi Sains Madrasah (KSM) Nasional Bidang Matematika Terintegrasi',
    jenisPrestasi: 'Akademik',
    bidangPrestasi: 'Sains & Riset (KSM / MYRES)',
    tingkatLomba: 'Nasional',
    juara: 'Medali Emas',
    penyelenggara: 'Direktorat KSKK Madrasah Ditjen Pendis Kemenag RI',
    tanggalPencapaian: '2026-09-18',
    guruPembimbing: 'Drs. H. Mulyadi, M.Pd.',
    fotoKegiatanUrl: '/src/assets/images/madrasah_hero_banner_1790990213941.jpg',
    piagamUrl: '/src/assets/images/sample_piagam_sertifikat_1790990228961.jpg',
    keterangan: 'Meraih skor sempurna dalam penyelesaian soal analisis terintegrasi sains dan pemahaman ayat Al-Qur\'an.',
    statusVerifikasi: 'Terverifikasi',
    createdAt: '2026-09-20T08:30:00Z',
    updatedAt: '2026-09-20T08:30:00Z'
  },
  {
    id: 'ach-002',
    namaSiswa: 'Nabila Zahra Putri',
    nisn: '0091122334',
    kelas: 'VIII-A (Bilingual)',
    jenisKelamin: 'P',
    tahunAjaran: '2026/2027',
    namaLomba: 'International Islamic Science & Innovation Olympiad (IISIO)',
    jenisPrestasi: 'Akademik',
    bidangPrestasi: 'Sains & Riset (KSM / MYRES)',
    tingkatLomba: 'Internasional',
    juara: 'Medali Emas',
    penyelenggara: 'ISRA Global Foundation & Istanbul University',
    tanggalPencapaian: '2026-08-14',
    guruPembimbing: 'Nurul Hidayati, S.Si., M.Sc.',
    fotoKegiatanUrl: '/src/assets/images/madrasah_hero_banner_1790990213941.jpg',
    piagamUrl: '/src/assets/images/sample_piagam_sertifikat_1790990228961.jpg',
    keterangan: 'Karya inovasi bioplastik ramah lingkungan berbahan dasar pati singkong dan serat alami.',
    statusVerifikasi: 'Terverifikasi',
    createdAt: '2026-08-16T10:15:00Z',
    updatedAt: '2026-08-16T10:15:00Z'
  },
  {
    id: 'ach-003',
    namaSiswa: 'Aisyah Nur Fathimah',
    nisn: '0089876543',
    kelas: 'IX-Tahfidz',
    jenisKelamin: 'P',
    tahunAjaran: '2025/2026',
    namaLomba: 'Musabaqah Tilawatil Qur\'an (MTQ) Pelajar Cabang Hifdzil Qur\'an 10 Juz',
    jenisPrestasi: 'Non-Akademik',
    bidangPrestasi: 'Keagamaan & Tahfidz (MTQ / MQK)',
    tingkatLomba: 'Provinsi',
    juara: 'Juara 1',
    penyelenggara: 'Lembaga Pengembangan Tilawatil Qur\'an (LPTQ) Prov. Jawa Barat',
    tanggalPencapaian: '2026-03-22',
    guruPembimbing: 'Ust. Muhammad Rofi\'i, Al-Hafidz',
    fotoKegiatanUrl: '/src/assets/images/madrasah_hero_banner_1790990213941.jpg',
    piagamUrl: '/src/assets/images/sample_piagam_sertifikat_1790990228961.jpg',
    keterangan: 'Lolos sebagai kafilah utama mewakili provinsi ke tingkat nasional dengan nilai murni 99,2.',
    statusVerifikasi: 'Terverifikasi',
    createdAt: '2026-03-24T14:20:00Z',
    updatedAt: '2026-03-24T14:20:00Z'
  },
  {
    id: 'ach-004',
    namaSiswa: 'Fadhil Ihsan Pratama',
    nisn: '0076543210',
    kelas: 'IX-B',
    jenisKelamin: 'L',
    tahunAjaran: '2025/2026',
    namaLomba: 'Madrasah Young Researchers Supercamp (MYRES) Bidang MST',
    jenisPrestasi: 'Akademik',
    bidangPrestasi: 'Sains & Riset (KSM / MYRES)',
    tingkatLomba: 'Nasional',
    juara: 'Juara 2',
    penyelenggara: 'Direktorat Jenderal Pendidikan Islam Kemenag RI',
    tanggalPencapaian: '2025-11-10',
    guruPembimbing: 'Deden Sujana, S.Pd., M.T.',
    fotoKegiatanUrl: '/src/assets/images/madrasah_hero_banner_1790990213941.jpg',
    piagamUrl: '/src/assets/images/sample_piagam_sertifikat_1790990228961.jpg',
    keterangan: 'Prototipe sistem irigasi cerdas hemat air bertenaga surya untuk pertanian hidroponik pesantren.',
    statusVerifikasi: 'Terverifikasi',
    createdAt: '2025-11-12T09:00:00Z',
    updatedAt: '2025-11-12T09:00:00Z'
  },
  {
    id: 'ach-005',
    namaSiswa: 'Rayhan Ahmad Zulkarnain',
    nisn: '0084455667',
    kelas: 'VIII-D',
    jenisKelamin: 'L',
    tahunAjaran: '2025/2026',
    namaLomba: 'Pekan Olahraga dan Seni Antar Madrasah (POSKRAM) Cabang Pencak Silat',
    jenisPrestasi: 'Non-Akademik',
    bidangPrestasi: 'Olahraga & Beladiri (POSKRAM / O2SN)',
    tingkatLomba: 'Kabupaten/Kota',
    juara: 'Juara 1',
    penyelenggara: 'Kantor Kementerian Agama Kota Bandung & IPSI',
    tanggalPencapaian: '2026-02-05',
    guruPembimbing: 'Kang Dindin Supriatna',
    fotoKegiatanUrl: '/src/assets/images/madrasah_hero_banner_1790990213941.jpg',
    piagamUrl: '/src/assets/images/sample_piagam_sertifikat_1790990228961.jpg',
    keterangan: 'Tanding Kelas C Putra (42-45 kg) menang telak di babak final.',
    statusVerifikasi: 'Terverifikasi',
    createdAt: '2026-02-06T11:45:00Z',
    updatedAt: '2026-02-06T11:45:00Z'
  },
  {
    id: 'ach-006',
    namaSiswa: 'Siti Khadijah Al-Munawwarah',
    nisn: '0092233445',
    kelas: 'VIII-C',
    jenisKelamin: 'P',
    tahunAjaran: '2024/2025',
    namaLomba: 'Festival Seni Budaya Islam Cabang Kaligrafi Khat Kontemporer',
    jenisPrestasi: 'Non-Akademik',
    bidangPrestasi: 'Seni & Budaya (FLS2N / Kaligrafi)',
    tingkatLomba: 'Provinsi',
    juara: 'Juara 1',
    penyelenggara: 'Kanwil Kementerian Agama Jawa Barat',
    tanggalPencapaian: '2025-01-20',
    guruPembimbing: 'Ust. Badruzzaman, S.Pd.I',
    fotoKegiatanUrl: '/src/assets/images/madrasah_hero_banner_1790990213941.jpg',
    piagamUrl: '/src/assets/images/sample_piagam_sertifikat_1790990228961.jpg',
    keterangan: 'Karya bertema "Rahmatan Lil Alamin" dengan media kanvas akrilik relief timbul.',
    statusVerifikasi: 'Terverifikasi',
    createdAt: '2025-01-22T13:10:00Z',
    updatedAt: '2025-01-22T13:10:00Z'
  },
  {
    id: 'ach-007',
    namaSiswa: 'Bilqis Syahira & Tim Robotik',
    nisn: '0079988776',
    kelas: 'IX-B',
    jenisKelamin: 'P',
    tahunAjaran: '2025/2026',
    namaLomba: 'Madrasah Robotic Competition (MRC) Kategori Mobile Robot Autonomous',
    jenisPrestasi: 'Akademik',
    bidangPrestasi: 'Robotik & Teknologi Informasi',
    tingkatLomba: 'Nasional',
    juara: 'Juara Harapan 1',
    penyelenggara: 'Direktorat KSKK Madrasah Kemenag RI',
    tanggalPencapaian: '2025-10-28',
    guruPembimbing: 'Rahmat Kurnia, S.Kom.',
    fotoKegiatanUrl: '/src/assets/images/madrasah_hero_banner_1790990213941.jpg',
    piagamUrl: '/src/assets/images/sample_piagam_sertifikat_1790990228961.jpg',
    keterangan: 'Robot pemadam api cerdas bersensor inframerah dan deteksi rintangan ultrasonic.',
    statusVerifikasi: 'Terverifikasi',
    createdAt: '2025-10-30T16:00:00Z',
    updatedAt: '2025-10-30T16:00:00Z'
  },
  {
    id: 'ach-008',
    namaSiswa: 'Zaky Maulana Farhan',
    nisn: '0087766554',
    kelas: 'VII-C',
    jenisKelamin: 'L',
    tahunAjaran: '2026/2027',
    namaLomba: 'Lomba Pidato Bahasa Arab Pekan Rajabiyah Pelajar',
    jenisPrestasi: 'Non-Akademik',
    bidangPrestasi: 'Bahasa & Sastra (Pidato / Debat)',
    tingkatLomba: 'Kecamatan',
    juara: 'Juara 1',
    penyelenggara: 'Kelompok Kerja Madrasah (KKM) Kec. Sukajadi',
    tanggalPencapaian: '2026-09-02',
    guruPembimbing: 'Ustadzah Halimah, S.Pd.I',
    fotoKegiatanUrl: '/src/assets/images/madrasah_hero_banner_1790990213941.jpg',
    piagamUrl: '/src/assets/images/sample_piagam_sertifikat_1790990228961.jpg',
    keterangan: 'Penyampaian tema "Pendidikan Karakter Santri di Era Digital" dengan fasih.',
    statusVerifikasi: 'Terverifikasi',
    createdAt: '2026-09-03T10:00:00Z',
    updatedAt: '2026-09-03T10:00:00Z'
  },
  {
    id: 'ach-009',
    namaSiswa: 'Fauzan Aditama',
    nisn: '0083322119',
    kelas: 'VIII-B',
    jenisKelamin: 'L',
    tahunAjaran: '2024/2025',
    namaLomba: 'Olimpiade Sains Nasional (OSN) Tingkat Kabupaten/Kota Bidang IPA',
    jenisPrestasi: 'Akademik',
    bidangPrestasi: 'Sains & Riset (KSM / MYRES)',
    tingkatLomba: 'Kabupaten/Kota',
    juara: 'Juara 2',
    penyelenggara: 'BPTI Puspresnas Kemendikbudristek',
    tanggalPencapaian: '2025-05-18',
    guruPembimbing: 'Dra. Hj. Euis Karlina',
    fotoKegiatanUrl: '/src/assets/images/madrasah_hero_banner_1790990213941.jpg',
    piagamUrl: '/src/assets/images/sample_piagam_sertifikat_1790990228961.jpg',
    keterangan: 'Lolos seleksi tahap kota dengan peringkat 2 dari 180 peserta perwakilan sekolah.',
    statusVerifikasi: 'Terverifikasi',
    createdAt: '2025-05-20T11:20:00Z',
    updatedAt: '2025-05-20T11:20:00Z'
  }
];

export const TAHUN_AJARAN_OPTIONS = [
  '2026/2027',
  '2025/2026',
  '2024/2025',
  '2023/2024'
];

export const TINGKAT_LOMBA_OPTIONS = [
  'Kecamatan',
  'Kabupaten/Kota',
  'Provinsi',
  'Nasional',
  'Internasional'
];

export const BIDANG_PRESTASI_OPTIONS = [
  'Sains & Riset (KSM / MYRES)',
  'Keagamaan & Tahfidz (MTQ / MQK)',
  'Olahraga & Beladiri (POSKRAM / O2SN)',
  'Seni & Budaya (FLS2N / Kaligrafi)',
  'Bahasa & Sastra (Pidato / Debat)',
  'Robotik & Teknologi Informasi',
  'Pramuka & Kepemimpinan',
  'Lainnya'
];

export const JUARA_OPTIONS = [
  'Juara 1',
  'Juara 2',
  'Juara 3',
  'Juara Harapan 1',
  'Juara Harapan 2',
  'Juara Harapan 3',
  'Medali Emas',
  'Medali Perak',
  'Medali Perunggu',
  'Finalis',
  'Penghargaan Khusus'
];

export const KELAS_OPTIONS = [
  'VII-A',
  'VII-B',
  'VII-C',
  'VII-D',
  'VIII-A',
  'VIII-B',
  'VIII-C',
  'VIII-D',
  'IX-A',
  'IX-B',
  'IX-C',
  'IX-Tahfidz'
];
