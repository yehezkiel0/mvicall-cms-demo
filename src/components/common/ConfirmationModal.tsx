import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConfirmationModal: React.FC = () => {
  const { confirmDialog, closeConfirmation } = useApp();
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (confirmDialog) {
      setReason(confirmDialog.defaultReason || '');
      setError('');
    }
  }, [confirmDialog]);

  if (!confirmDialog || !confirmDialog.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmDialog.requireReason !== false && !reason.trim()) {
      setError('Alasan tindakan wajib diisi untuk catatan log audit.');
      return;
    }
    confirmDialog.onConfirm(reason.trim());
    closeConfirmation();
  };

  const handlePresetClick = (preset: string) => {
    setReason(preset);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                confirmDialog.isDestructive
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-[#1F4E79]/10 text-[#1F4E79]'
              }`}
            >
              {confirmDialog.isDestructive ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {confirmDialog.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfirmasi otorisasi tindakan administratif
              </p>
            </div>
          </div>
          <button
            onClick={closeConfirmation}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {confirmDialog.description}
            </p>

            {/* Required Alasan Field */}
            {confirmDialog.requireReason !== false && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Alasan Tindakan <span className="text-rose-500">* (Wajib diisi)</span>
                </label>
                
                {confirmDialog.suggestedReasons && confirmDialog.suggestedReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {confirmDialog.suggestedReasons.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handlePresetClick(preset)}
                        className="text-[11px] font-medium px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  placeholder={
                    confirmDialog.reasonPlaceholder ||
                    'Tuliskan alasan lengkap untuk arsip Log Aktivitas...'
                  }
                  className={`w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    error
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]'
                  }`}
                  autoFocus
                />
                {error && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <Info className="w-3.5 h-3.5" /> {error}
                  </p>
                )}
                <p className="text-[11px] text-slate-400">
                  Tindakan ini akan dicatat ke dalam menu Log Aktivitas CMS beserta nama admin dan timestamp.
                </p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={closeConfirmation}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-medium text-white rounded-lg shadow-xs transition-colors ${
                confirmDialog.isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-[#1F4E79] hover:bg-[#163a5c]'
              }`}
            >
              {confirmDialog.confirmLabel || 'Konfirmasi & Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
