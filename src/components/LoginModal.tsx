import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { SchoolProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (adminName: string) => void;
  schoolProfile: SchoolProfile;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  schoolProfile,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('madrasah123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Valid credentials: username 'admin' or 'kesiswaan' or email, password 'madrasah123' or 'admin123' or 'admin'
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      const isValid = 
        (cleanUser === 'admin' || cleanUser === 'kesiswaan' || cleanUser.includes('@')) && 
        (cleanPass === 'madrasah123' || cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === '123456');

      if (isValid) {
        setIsSuccess(true);
        if (rememberMe) {
          localStorage.setItem('puspresma_auth_admin', 'true');
          localStorage.setItem('puspresma_admin_name', cleanUser === 'admin' ? 'Administrator Madrasah' : username);
        }
        setTimeout(() => {
          setIsSuccess(false);
          onLoginSuccess(cleanUser === 'admin' ? 'Administrator Madrasah' : username);
          onClose();
        }, 600);
      } else {
        setErrorMsg('Nama pengguna atau kata sandi tidak cocok. Gunakan akun demo yang tersedia di bawah.');
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('madrasah123');
    setErrorMsg('');
    setIsSuccess(true);
    if (rememberMe) {
      localStorage.setItem('puspresma_auth_admin', 'true');
      localStorage.setItem('puspresma_admin_name', 'Administrator Madrasah');
    }
    setTimeout(() => {
      setIsSuccess(false);
      onLoginSuccess('Administrator Madrasah');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-md w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-900 to-teal-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-200 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Login Admin PUSPRESMA
              </h2>
              <p className="text-xs text-emerald-200/90 truncate max-w-[260px]">
                {schoolProfile.namaMadrasah}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <div className="mb-5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-slate-700">
            <p className="font-semibold text-emerald-900 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              Akses Pengelola Madrasah
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Silakan masuk untuk menginput prestasi siswa, menyunting data piagam & dokumentasi, melakukan verifikasi, dan mengelola arsip akreditasi.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">Login Berhasil! Mengalihkan ke mode admin...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Pengguna / NIP / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin atau kesiswaan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-xs font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-slate-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
              >
                1-Klik Masuk Demo
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : isSuccess ? 'Berhasil Masuk' : 'Masuk Sebagai Admin'}</span>
            </button>
          </form>

          {/* Quick Credential Box */}
          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 text-[11px] text-slate-500 rounded-b-2xl">
            <p className="font-semibold text-slate-700 mb-1">
              Kredensial Akun Percobaan (Demo Admin):
            </p>
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono text-[10.5px]">
              <span>Username: <strong className="text-slate-800">admin</strong></span>
              <span className="text-slate-300">|</span>
              <span>Password: <strong className="text-slate-800">madrasah123</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Pengunjung tanpa login tetap dapat mengakses & melihat seluruh dashboard ringkasan madrasah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
