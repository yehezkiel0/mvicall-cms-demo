import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Shield,
  Smartphone,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppSettings } from '../types';

export const AppSettingsPage: React.FC = () => {
  const {
    appSettings,
    saveAppSettings,
    requestConfirmation,
    canPerformAction,
    role,
  } = useApp();

  const [settings, setSettings] = useState<AppSettings>(appSettings);
  const isAllowedToEdit = canPerformAction();

  const handleToggle = (key: keyof AppSettings) => {
    if (!isAllowedToEdit) return;
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key: keyof AppSettings, val: string) => {
    if (!isAllowedToEdit) return;
    setSettings((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    requestConfirmation({
      title: 'Simpan Konfigurasi Pengaturan Aplikasi?',
      description:
        'Seluruh perubahan feature toggles, versi minimum aplikasi, dan teks sistem akan disinkronkan ke aplikasi klien MViCall.',
      confirmLabel: 'Simpan Pengaturan',
      isDestructive: false,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan pembaruan pengaturan aplikasi...',
      suggestedReasons: [
        'Pembaruan kebijakan versi minimum aplikasi rilis bulanan',
        'Penyesuaian teks penjelasan fitur videotone',
        'Aktivasi modul Kamera Snap & Lens terbaru',
      ],
      onConfirm: (reason) => saveAppSettings(settings, reason),
    });
  };

  const handleResetToDefault = () => {
    setSettings(appSettings);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Pengaturan Aplikasi MViCall
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi fitur dinamis klien, kontrol versi aplikasi, status mode pemeliharaan (maintenance), dan teks panduan antarmuka.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Feature Toggles */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-[#1F4E79]" />
            <h3 className="text-sm font-bold text-slate-900">
              Feature Toggles (Sakelar Fitur)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1: Kamera Snap */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    Kamera Snap / Lens
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle('featureSnapLens')}
                    disabled={!isAllowedToEdit}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.featureSnapLens ? 'bg-[#1F4E79]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        settings.featureSnapLens ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                  Izinkan pengguna merekam video ringtone langsung dengan filter lensa wajah AR interaktif.
                </p>
              </div>
              <span className="text-[10px] font-mono mt-3 font-semibold text-slate-400">
                Status: {settings.featureSnapLens ? 'Aktif' : 'Non-Aktif'}
              </span>
            </div>

            {/* Feature 2: Status Teks Melayang */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    Status Teks Melayang
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle('featureFloatingText')}
                    disabled={!isAllowedToEdit}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.featureFloatingText ? 'bg-[#1F4E79]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        settings.featureFloatingText ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                  Fitur menambahkan pesan status teks melayang (running text) di atas video saat memanggil kontak.
                </p>
              </div>
              <span className="text-[10px] font-mono mt-3 font-semibold text-slate-400">
                Status: {settings.featureFloatingText ? 'Aktif' : 'Non-Aktif'}
              </span>
            </div>

            {/* Feature 3: Share Video */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    Share Video
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle('featureShareVideo')}
                    disabled={!isAllowedToEdit}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.featureShareVideo ? 'bg-[#1F4E79]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        settings.featureShareVideo ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                  Izinkan pengguna membagikan tautan preview videotone mereka ke WhatsApp, Instagram, dan TikTok.
                </p>
              </div>
              <span className="text-[10px] font-mono mt-3 font-semibold text-slate-400">
                Status: {settings.featureShareVideo ? 'Aktif' : 'Non-Aktif'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: App Version Control & Maintenance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Version Control */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Smartphone className="w-4 h-4 text-[#1F4E79]" />
              <h3 className="text-sm font-bold text-slate-900">
                Versi Minimum Aplikasi (Force Update)
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pengguna dengan versi di bawah batasan ini akan diarahkan secara wajib untuk memperbarui aplikasi di Google Play Store atau Apple App Store.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Min. Versi Android
                </label>
                <input
                  type="text"
                  value={settings.minAppVersionAndroid}
                  onChange={(e) => handleChange('minAppVersionAndroid', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Min. Versi iOS
                </label>
                <input
                  type="text"
                  value={settings.minAppVersionIos}
                  onChange={(e) => handleChange('minAppVersionIos', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Mode Pemeliharaan (Maintenance)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('maintenanceMode')}
                disabled={!isAllowedToEdit}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    settings.maintenanceMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <label className="block font-semibold text-slate-700">
                Pesan Notifikasi Maintenance di Layar Aplikasi
              </label>
              <textarea
                rows={3}
                value={settings.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
              />
              <span className="text-[11px] text-slate-400 block">
                Jika diaktifkan, pengguna tidak dapat login dan hanya melihat pesan di atas.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Editable System Texts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-[#1F4E79]" />
            <h3 className="text-sm font-bold text-slate-900">
              Teks Panduan & Edukasi Sistem (In-App Copywriting)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tooltip Penjelasan "Videotone"
              </label>
              <textarea
                rows={3}
                value={settings.tooltipVideotone}
                onChange={(e) => handleChange('tooltipVideotone', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tooltip Penjelasan "VRBT" (Video Ring Back Tone)
              </label>
              <textarea
                rows={3}
                value={settings.tooltipVrbt}
                onChange={(e) => handleChange('tooltipVrbt', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teks Halaman "Apa itu MViCall"
              </label>
              <textarea
                rows={3}
                value={settings.textAboutMViCall}
                onChange={(e) => handleChange('textAboutMViCall', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teks Panduan Halaman Unggah Video Pengguna
              </label>
              <textarea
                rows={3}
                value={settings.textUploadPage}
                onChange={(e) => handleChange('textUploadPage', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
              />
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Perubahan</span>
          </button>

          <button
            type="submit"
            disabled={!isAllowedToEdit}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors ${
              !isAllowedToEdit
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-[#1F4E79] hover:bg-[#163a5c] cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan Aplikasi</span>
          </button>
        </div>
      </form>
    </div>
  );
};
