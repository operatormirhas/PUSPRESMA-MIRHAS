/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StudentAchievement, SchoolProfile, FilterState } from './types';
import { 
  getStoredAchievements, 
  saveAchievementsToStorage, 
  getStoredSchoolProfile, 
  saveSchoolProfileToStorage, 
  resetToInitialData 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AchievementListView } from './components/AchievementListView';
import { AchievementFormModal } from './components/AchievementFormModal';
import { PrintReportModal } from './components/PrintReportModal';
import { DetailModal } from './components/DetailModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { LoginModal } from './components/LoginModal';
import { AppsScriptModal } from './components/AppsScriptModal';
import { 
  getStoredAppsScriptUrl, 
  saveAppsScriptUrl, 
  deleteAchievementFromGAS,
  fetchAchievementsFromGAS,
  getStoredAutoSyncEnabled,
  saveAutoSyncEnabled,
  getStoredSyncInterval,
  saveSyncInterval,
  getStoredLastSyncTime,
  saveLastSyncTime
} from './utils/appsScript';
import { CheckCircle2, Info, Cloud } from 'lucide-react';

export default function App() {
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(getStoredSchoolProfile());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'input' | 'print'>('dashboard');
  
  // Admin authentication state (persisted or guest mode)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('puspresma_auth_admin') === 'true';
  });
  const [adminName, setAdminName] = useState<string>(() => {
    return localStorage.getItem('puspresma_admin_name') || 'Administrator Madrasah';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Google Apps Script, Spreadsheet, & Drive integration state
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => getStoredAppsScriptUrl());
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => getStoredAutoSyncEnabled());
  const [syncInterval, setSyncInterval] = useState<number>(() => getStoredSyncInterval());
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const stored = getStoredLastSyncTime();
    return stored ? new Date(stored) : null;
  });

  // Filter state for search and tabs
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    tahunAjaran: 'Semua',
    tingkatLomba: 'Semua',
    jenisPrestasi: 'Semua',
    bidangPrestasi: 'Semua',
    kelas: 'Semua',
    statusVerifikasi: 'Semua',
  });

  // Modals state
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentAchievement | null>(null);
  const [detailItem, setDetailItem] = useState<StudentAchievement | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [preselectedPrintItem, setPreselectedPrintItem] = useState<StudentAchievement | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Use ref to keep track of current achievements without causing infinite effect loops
  const achievementsRef = useRef<StudentAchievement[]>(achievements);
  useEffect(() => {
    achievementsRef.current = achievements;
  }, [achievements]);

  // Initial load from local storage
  useEffect(() => {
    const loadedAchievements = getStoredAchievements();
    const loadedProfile = getStoredSchoolProfile();
    setAchievements(loadedAchievements);
    setSchoolProfile(loadedProfile);
  }, []);

  // Multi-User Cross-Device & Background Real-Time Cloud Synchronization
  const performCloudSync = useCallback(async (isBackground = false) => {
    const currentUrl = appsScriptUrl?.trim();
    if (!currentUrl) return;

    setIsCloudSyncing(true);
    try {
      const freshData = await fetchAchievementsFromGAS(currentUrl);
      if (Array.isArray(freshData)) {
        const currentData = achievementsRef.current;
        // Compare with current state
        const currentJson = JSON.stringify(currentData);
        const freshJson = JSON.stringify(freshData);

        if (currentJson !== freshJson) {
          setAchievements(freshData);
          saveAchievementsToStorage(freshData);
          if (isBackground && currentData.length > 0 && freshData.length !== currentData.length) {
            showToast(`Data prestasi otomatis disinkronkan (${freshData.length} data di Spreadsheet).`);
          }
        }
        const now = new Date();
        setLastSyncTime(now);
        saveLastSyncTime(now.toISOString());
        if (!isBackground) {
          showToast(`Sinkronisasi sukses! ${freshData.length} data diperbarui dari Google Sheets.`);
        }
      }
    } catch (err: any) {
      if (!isBackground) {
        showToast(`Gagal sinkronisasi: ${err.message || 'Periksa koneksi Apps Script'}`);
      }
    } finally {
      setIsCloudSyncing(false);
    }
  }, [appsScriptUrl, showToast]);

  // Auto-sync polling loop and window focus sync (so when multiple people open at same time, data stays in sync!)
  useEffect(() => {
    if (!appsScriptUrl?.trim() || !autoSyncEnabled) return;

    // 1. Initial silent background sync on mount or URL change
    performCloudSync(true);

    // 2. Periodic polling interval
    const intervalMs = Math.max(5, syncInterval) * 1000;
    const timerId = setInterval(() => {
      performCloudSync(true);
    }, intervalMs);

    // 3. Instant sync when tab regains focus or visibility
    const handleFocus = () => {
      performCloudSync(true);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        performCloudSync(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timerId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [appsScriptUrl, autoSyncEnabled, syncInterval, performCloudSync]);

  // Cross-tab synchronization via localStorage events (instant update across tabs in same browser)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'puspresma_achievements_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setAchievements(parsed);
          }
        } catch {
          // ignore
        }
      }
      if (e.key === 'puspresma_apps_script_url') {
        setAppsScriptUrl(e.newValue || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (name: string) => {
    setIsAdmin(true);
    setAdminName(name);
    showToast(`Selamat datang, ${name}! Anda telah masuk ke portal admin.`);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('puspresma_auth_admin');
    localStorage.removeItem('puspresma_admin_name');
    showToast('Anda telah keluar dari akun admin.');
  };

  // Safe handler for inputting achievement with login guard
  const handleRequestOpenInput = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      showToast('Silakan login sebagai admin untuk menginput data prestasi siswa.');
      return;
    }
    setEditingItem(null);
    setIsInputModalOpen(true);
  };

  const handleSaveAchievement = (item: StudentAchievement) => {
    let updated: StudentAchievement[];
    const exists = achievements.some((a) => a.id === item.id);
    if (exists) {
      updated = achievements.map((a) => (a.id === item.id ? item : a));
      showToast(`Prestasi "${item.namaLomba}" berhasil diperbarui.`);
    } else {
      updated = [item, ...achievements];
      showToast(`Prestasi siswa atas nama ${item.namaSiswa} berhasil dicatat!`);
    }
    setAchievements(updated);
    saveAchievementsToStorage(updated);
    setEditingItem(null);

    // Trigger immediate background sync to ensure spreadsheet and drive are aligned
    if (appsScriptUrl?.trim()) {
      setTimeout(() => performCloudSync(true), 1500);
    }
  };

  const handleDeleteAchievement = (id: string) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const target = achievements.find((a) => a.id === id);
    const updated = achievements.filter((a) => a.id !== id);
    setAchievements(updated);
    saveAchievementsToStorage(updated);
    if (appsScriptUrl?.trim()) {
      deleteAchievementFromGAS(appsScriptUrl.trim(), id);
    }
    if (target) {
      showToast(`Data prestasi ${target.namaSiswa} telah dihapus.`);
    }
  };

  const handleVerifyAchievement = (id: string, status: 'Terverifikasi' | 'Menunggu Verifikasi') => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const updated = achievements.map((a) => (a.id === id ? { ...a, statusVerifikasi: status } : a));
    setAchievements(updated);
    saveAchievementsToStorage(updated);
    if (detailItem && detailItem.id === id) {
      setDetailItem({ ...detailItem, statusVerifikasi: status });
    }
    showToast(`Status prestasi diubah menjadi: ${status}`);
  };

  const handleSaveProfile = (newProfile: SchoolProfile) => {
    setSchoolProfile(newProfile);
    saveSchoolProfileToStorage(newProfile);
    showToast('Profil madrasah & kop surat berhasil disimpan.');
  };

  const handleImportAchievements = (data: StudentAchievement[]) => {
    setAchievements(data);
    saveAchievementsToStorage(data);
    showToast(`Berhasil memulihkan ${data.length} data prestasi.`);
  };

  const handleResetData = () => {
    const reset = resetToInitialData();
    setAchievements(reset.achievements);
    setSchoolProfile(reset.profile);
    showToast('Data dikembalikan ke data percontohan madrasah.');
  };

  const handleOpenEdit = (item: StudentAchievement) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingItem(item);
    setIsInputModalOpen(true);
  };

  const handlePrintSingle = (item: StudentAchievement) => {
    setPreselectedPrintItem(item);
    setIsPrintModalOpen(true);
  };

  const handleNavigateToData = (filterYear?: string) => {
    if (filterYear) {
      setFilterState((prev) => ({ ...prev, tahunAjaran: filterYear }));
    }
    setActiveTab('data');
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    saveAutoSyncEnabled(enabled);
    showToast(enabled ? 'Sinkronisasi otomatis diaktifkan.' : 'Sinkronisasi otomatis dijeda.');
  };

  const handleChangeSyncInterval = (seconds: number) => {
    setSyncInterval(seconds);
    saveSyncInterval(seconds);
    showToast(`Interval sinkronisasi diatur ke ${seconds} detik.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'print') {
            setPreselectedPrintItem(null);
            setIsPrintModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isAdmin={isAdmin}
        adminName={adminName}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        schoolProfile={schoolProfile}
        onOpenSettings={() => {
          if (!isAdmin) {
            setIsLoginModalOpen(true);
            return;
          }
          setIsSettingsModalOpen(true);
        }}
        onOpenInputModal={handleRequestOpenInput}
        onOpenAppsScript={() => setIsAppsScriptModalOpen(true)}
        isAppsScriptConnected={!!appsScriptUrl}
        onRefreshCloud={() => performCloudSync(false)}
        isCloudSyncing={isCloudSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            achievements={achievements}
            schoolProfile={schoolProfile}
            isAdmin={isAdmin}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onNavigateToData={handleNavigateToData}
            onOpenInput={handleRequestOpenInput}
            onOpenPrint={() => {
              setPreselectedPrintItem(null);
              setIsPrintModalOpen(true);
            }}
            onViewDetail={(item) => setDetailItem(item)}
            appsScriptUrl={appsScriptUrl}
            isCloudSyncing={isCloudSyncing}
            lastSyncTime={lastSyncTime}
            autoSyncEnabled={autoSyncEnabled}
            onManualSync={() => performCloudSync(false)}
            onToggleAutoSync={handleToggleAutoSync}
            onOpenAppsScript={() => setIsAppsScriptModalOpen(true)}
          />
        )}

        {(activeTab === 'data' || activeTab === 'input') && (
          <AchievementListView
            achievements={achievements}
            schoolProfile={schoolProfile}
            filterState={filterState}
            setFilterState={setFilterState}
            isAdmin={isAdmin}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenInput={handleRequestOpenInput}
            onOpenPrint={() => {
              setPreselectedPrintItem(null);
              setIsPrintModalOpen(true);
            }}
            onViewDetail={(item) => setDetailItem(item)}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteAchievement}
            onVerify={handleVerifyAchievement}
            onPrintSingle={handlePrintSingle}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">PUSPRESMA</span>
            <span>·</span>
            <span>Pusat Prestasi Siswa Madrasah</span>
            <span>·</span>
            <span className="font-medium text-emerald-800">{schoolProfile.namaMadrasah}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Sistem Informasi Pengarsipan Prestasi & Akreditasi Madrasah Terpadu
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        schoolProfile={schoolProfile}
      />

      <AchievementFormModal
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveAchievement}
        initialData={editingItem}
        schoolProfile={schoolProfile}
        appsScriptUrl={appsScriptUrl}
      />

      <DetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteAchievement}
        onVerify={handleVerifyAchievement}
        onPrintSingle={handlePrintSingle}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPreselectedPrintItem(null);
        }}
        achievements={achievements}
        schoolProfile={schoolProfile}
        preselectedAchievement={preselectedPrintItem}
      />

      <SchoolSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={schoolProfile}
        onSaveProfile={handleSaveProfile}
        achievements={achievements}
        onImportAchievements={handleImportAchievements}
        onResetData={handleResetData}
      />

      <AppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
        appsScriptUrl={appsScriptUrl}
        onUrlChange={(newUrl) => {
          setAppsScriptUrl(newUrl);
          saveAppsScriptUrl(newUrl);
          showToast(newUrl ? 'URL Apps Script tersimpan.' : 'URL Apps Script dihapus.');
          if (newUrl) {
            setTimeout(() => performCloudSync(false), 500);
          }
        }}
        achievements={achievements}
        schoolProfile={schoolProfile}
        onDataSynced={(freshData) => {
          setAchievements(freshData);
          saveAchievementsToStorage(freshData);
          showToast(`Sinkronisasi sukses! ${freshData.length} data diperbarui dari Google Sheets.`);
        }}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={handleToggleAutoSync}
        syncInterval={syncInterval}
        onChangeSyncInterval={handleChangeSyncInterval}
        lastSyncTime={lastSyncTime}
        onManualSync={() => performCloudSync(false)}
        isCloudSyncing={isCloudSyncing}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 border border-slate-800 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
