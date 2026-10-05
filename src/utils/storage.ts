import { StudentAchievement, SchoolProfile } from '../types';
import { INITIAL_ACHIEVEMENTS, INITIAL_SCHOOL_PROFILE } from '../data/initialData';

const ACHIEVEMENTS_KEY = 'puspresma_achievements_v1';
const PROFILE_KEY = 'puspresma_school_profile_v1';

export function getStoredAchievements(): StudentAchievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(INITIAL_ACHIEVEMENTS));
      return INITIAL_ACHIEVEMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ACHIEVEMENTS;
  } catch (err) {
    console.error('Error loading achievements from storage:', err);
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievementsToStorage(achievements: StudentAchievement[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch (err) {
    console.error('Error saving achievements to storage:', err);
  }
}

export function getStoredSchoolProfile(): SchoolProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_SCHOOL_PROFILE));
      return INITIAL_SCHOOL_PROFILE;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading school profile:', err);
    return INITIAL_SCHOOL_PROFILE;
  }
}

export function saveSchoolProfileToStorage(profile: SchoolProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving school profile:', err);
  }
}

export function resetToInitialData(): { achievements: StudentAchievement[]; profile: SchoolProfile } {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(INITIAL_ACHIEVEMENTS));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_SCHOOL_PROFILE));
  return {
    achievements: INITIAL_ACHIEVEMENTS,
    profile: INITIAL_SCHOOL_PROFILE
  };
}

/**
 * Compress an uploaded file image to base64 DataURL (max width/height 1200px, JPEG quality 0.8)
 */
export function compressImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's a PDF or not an image
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Export achievements to CSV format
 */
export function exportAchievementsToCSV(achievements: StudentAchievement[], schoolName: string): void {
  const headers = [
    'No',
    'NISN',
    'Nama Siswa',
    'Kelas',
    'L/P',
    'Tahun Ajaran',
    'Nama Kejuaraan / Lomba',
    'Peringkat / Capaian',
    'Tingkat',
    'Kategori Bidang',
    'Jenis Prestasi',
    'Penyelenggara',
    'Tanggal Pencapaian',
    'Guru Pembimbing',
    'Status Verifikasi',
    'Keterangan'
  ];

  const rows = achievements.map((item, index) => [
    (index + 1).toString(),
    `"${item.nisn}"`,
    `"${item.namaSiswa.replace(/"/g, '""')}"`,
    `"${item.kelas}"`,
    item.jenisKelamin,
    `"${item.tahunAjaran}"`,
    `"${item.namaLomba.replace(/"/g, '""')}"`,
    `"${item.juara}"`,
    `"${item.tingkatLomba}"`,
    `"${item.bidangPrestasi}"`,
    `"${item.jenisPrestasi}"`,
    `"${item.penyelenggara.replace(/"/g, '""')}"`,
    item.tanggalPencapaian,
    `"${(item.guruPembimbing || '-').replace(/"/g, '""')}"`,
    `"${item.statusVerifikasi}"`,
    `"${(item.keterangan || '-').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeDate = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Prestasi_Siswa_${schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${safeDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format Indonesian date string (e.g. 18 September 2026)
 */
export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    const monthIndex = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${months[monthIndex] || month} ${year}`;
  } catch {
    return dateString;
  }
}
