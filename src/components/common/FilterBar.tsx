import React from 'react';
import { Search, Filter, Calendar, X, Download } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  statusOptions?: FilterOption[];
  selectedStatus?: string;
  onStatusChange?: (val: string) => void;
  productOptions?: FilterOption[];
  selectedProduct?: string;
  onProductChange?: (val: string) => void;
  dateRange?: string;
  onDateRangeChange?: (val: string) => void;
  onExportCsv?: () => void;
  extraActions?: React.ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = 'Cari...',
  searchValue,
  onSearchChange,
  statusOptions,
  selectedStatus,
  onStatusChange,
  productOptions,
  selectedProduct,
  onProductChange,
  dateRange,
  onDateRangeChange,
  onExportCsv,
  extraActions,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search input */}
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        {statusOptions && onStatusChange && (
          <div className="relative">
            <select
              value={selectedStatus || 'all'}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs py-1.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] appearance-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
              ▼
            </div>
          </div>
        )}

        {/* Product Dropdown */}
        {productOptions && onProductChange && (
          <div className="relative">
            <select
              value={selectedProduct || 'all'}
              onChange={(e) => onProductChange(e.target.value)}
              className="text-xs py-1.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] appearance-none cursor-pointer"
            >
              <option value="all">Semua Produk</option>
              {productOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
              ▼
            </div>
          </div>
        )}

        {/* Date Range Dropdown */}
        {onDateRangeChange && (
          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={dateRange || '30d'}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="text-xs py-1.5 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] appearance-none cursor-pointer"
            >
              <option value="today">Hari Ini</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="this_month">Bulan Ini (Okt 2026)</option>
              <option value="all">Semua Waktu</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
              ▼
            </div>
          </div>
        )}

        {/* Reset filter button */}
        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-md flex items-center gap-1 font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        )}
        {extraActions}
      </div>
    </div>
  );
};
