import React from 'react';
import { SchoolProfile } from '../types';
import { 
  BarChart3, 
  FileSpreadsheet, 
  PlusCircle, 
  Printer, 
  Settings, 
  ShieldCheck, 
  GraduationCap,
  LogIn,
  LogOut,
  UserCheck,
  Cloud,
  FolderSync,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'data' | 'input' | 'print';
  setActiveTab: (tab: 'dashboard' | 'data' | 'input' | 'print') => void;
  isAdmin: boolean;
  adminName: string;
  onOpenLogin: () => void;
  onLogout: () => void;
  schoolProfile: SchoolProfile;
  onOpenSettings: () => void;
  onOpenInputModal: () => void;
  onOpenAppsScript: () => void;
  isAppsScriptConnected: boolean;
  onRefreshCloud?: () => void;
  isCloudSyncing?: boolean;
  lastSyncTime?: Date | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  adminName,
  onOpenLogin,
  onLogout,
  schoolProfile,
  onOpenSettings,
  onOpenInputModal,
  onOpenAppsScript,
  isAppsScriptConnected,
  onRefreshCloud,
  isCloudSyncing,
  lastSyncTime,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark (Clean single-line brand zone) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              {schoolProfile.logoUrl ? (
                <img 
                  src={schoolProfile.logoUrl} 
                  alt="Emblem" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <GraduationCap className="w-6 h-6 text-emerald-100" />
              )}
            </div>
            <div>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                    PUSPRESMA
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {schoolProfile.jenjang === 'MI, MTs & MA (Semua Jenjang / Terpadu)' ? 'MI · MTs · MA' : schoolProfile.jenjang || 'Madrasah'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[180px] sm:max-w-xs">
                  {schoolProfile.namaMadrasah}
                </p>
              </button>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Data Prestasi
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('input');
                  onOpenInputModal();
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'input'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Input Prestasi
              </button>
            )}

            <button
              onClick={() => setActiveTab('print')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'print'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              Cetak Laporan PDF
            </button>
          </nav>

          {/* Zone 3: Actions & Admin Authentication */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Apps Script & Drive Cloud Status Button */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenAppsScript}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isAppsScriptConnected 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title={
                  isAppsScriptConnected
                    ? `Terhubung ke Google Spreadsheet & Drive${lastSyncTime ? ` · Terakhir sinkron: ${lastSyncTime.toLocaleTimeString('id-ID')}` : ''}`
                    : 'Klik untuk menghubungkan Google Apps Script, Spreadsheet & Drive'
                }
              >
                <div className="relative">
                  <Cloud className="w-3.5 h-3.5 text-emerald-700" />
                  <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    isAppsScriptConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                </div>
                <span className="hidden xl:inline">
                  {isAppsScriptConnected ? 'Sheets & Drive Aktif' : 'Hubungkan Drive'}
                </span>
              </button>

              {isAppsScriptConnected && onRefreshCloud && (
                <button
                  onClick={onRefreshCloud}
                  disabled={isCloudSyncing}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  title={lastSyncTime ? `Segarkan data dari Google Spreadsheet sekarang (Terakhir: ${lastSyncTime.toLocaleTimeString('id-ID')})` : 'Segarkan data dari Google Spreadsheet sekarang'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                {/* Admin Status Pill */}
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="truncate max-w-[120px]">{adminName || 'Admin'}</span>
                </div>

                <button
                  onClick={onOpenSettings}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Pengaturan Profil & Kop Madrasah"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenInputModal}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  + Input Prestasi
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                  title="Keluar dari Akun Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  title="Masuk sebagai Admin Pengelola"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'data' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Data Prestasi
          </button>
          {isAdmin ? (
            <button
              onClick={() => {
                setActiveTab('input');
                onOpenInputModal();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                activeTab === 'input' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600'
              }`}
            >
              + Input
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap bg-emerald-700 text-white"
            >
              Login Admin
            </button>
          )}
          <button
            onClick={() => setActiveTab('print')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'print' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Cetak PDF
          </button>
        </div>
      </div>
    </header>
  );
};
