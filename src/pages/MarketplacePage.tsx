import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Grid,
  List,
  Music,
  Download,
  PhoneCall,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Tag,
  Check,
  Video,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MarketplaceItem, Column } from '../types';
import { DataTable } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { formatRupiah } from '../data/dummy';

export const MarketplacePage: React.FC = () => {
  const {
    marketplace,
    toggleMarketplaceVisibility,
    addMarketplaceItem,
    updateMarketplaceItem,
    reorderFeaturedMarketplace,
    requestConfirmation,
    canPerformAction,
    role,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);

  // Form states for adding content
  const [formTitle, setFormTitle] = useState<string>('');
  const [formArtist, setFormArtist] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Pop Indonesia');
  const [formPriceType, setFormPriceType] = useState<'free' | 'paid'>('paid');
  const [formPrice, setFormPrice] = useState<number>(3000);
  const [formDuration, setFormDuration] = useState<number>(28);
  const [formTags, setFormTags] = useState<string>('pop, viral, ringtone');
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [fakeUploadedFile, setFakeUploadedFile] = useState<string | null>(null);

  const isAllowedToManage = canPerformAction();

  // Categories list
  const categories = [
    'Pop Indonesia',
    'Dangdut Modern',
    'K-Pop',
    'Religi',
    'Viral TikTok',
    'Sound Effect',
    'Beat',
  ];

  // Filtered items
  const filteredItems = useMemo(() => {
    return marketplace.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.artist.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      const matchPrice =
        priceFilter === 'all' ||
        (priceFilter === 'free' && item.isFree) ||
        (priceFilter === 'paid' && !item.isFree);

      return matchSearch && matchCategory && matchPrice;
    });
  }, [marketplace, search, categoryFilter, priceFilter]);

  const featuredItems = useMemo(() => {
    return marketplace
      .filter((m) => m.isFeatured)
      .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));
  }, [marketplace]);

  const handleToggleVisibility = (item: MarketplaceItem) => {
    const nextState = !item.isVisible;
    requestConfirmation({
      title: `${nextState ? 'Tampilkan' : 'Sembunyikan'} Konten "${item.title}"?`,
      description: nextState
        ? `Konten ini akan langsung tersedia di katalog aplikasi MViCall untuk dibeli/diunduh pengguna.`
        : `Konten ini akan disembunyikan dari katalog pengguna. Pengguna yang telah membelinya tetap dapat menggunakannya.`,
      confirmLabel: nextState ? 'Tampilkan Konten' : 'Sembunyikan',
      isDestructive: !nextState,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan penyesuaian visibilitas konten...',
      suggestedReasons: [
        'Audit lisensi hak cipta berkala',
        'Rotasi konten berkala pada etalase aplikasi',
        'Penyesuaian rekomendasi tren mingguan',
      ],
      onConfirm: (reason) => toggleMarketplaceVisibility(item.id, reason),
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formArtist) return;

    requestConfirmation({
      title: `Publikasikan Konten "${formTitle}"?`,
      description: `Konten video ringtone baru akan ditambahkan ke Marketplace MViCall dengan kategori ${formCategory} (${formPriceType === 'free' ? 'Gratis' : formatRupiah(formPrice)}).`,
      confirmLabel: 'Publikasikan Konten',
      isDestructive: false,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan penambahan konten...',
      suggestedReasons: [
        'Rilis lagu viral baru dari label mitra',
        'Permintaan tinggi dari komunitas pengguna',
        'Kampanye promosi musiman',
      ],
      onConfirm: (reason) => {
        addMarketplaceItem(
          {
            title: formTitle,
            artist: formArtist,
            category: formCategory,
            price: formPriceType === 'free' ? 0 : formPrice,
            isFree: formPriceType === 'free',
            isVisible: true,
            isFeatured: formIsFeatured,
            featuredOrder: formIsFeatured ? featuredItems.length + 1 : undefined,
            durationSec: formDuration,
            colorGradient: 'from-blue-600 to-indigo-800',
            tags: formTags.split(',').map((t) => t.trim().toLowerCase()),
          },
          reason
        );
        setIsAddModalOpen(false);
        // Reset form
        setFormTitle('');
        setFormArtist('');
        setFakeUploadedFile(null);
      },
    });
  };

  // Move featured item up/down
  const moveFeatured = (index: number, direction: 'up' | 'down') => {
    const newItems = [...featuredItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // update orders
    const updatedWithOrder = newItems.map((item, idx) => ({
      ...item,
      featuredOrder: idx + 1,
    }));

    // Merge back to full marketplace list
    const otherItems = marketplace.filter((m) => !m.isFeatured);
    reorderFeaturedMarketplace(
      [...updatedWithOrder, ...otherItems],
      `Penataan ulang urutan unggulan: #${index + 1} ditukar dengan #${targetIndex + 1}`
    );
  };

  const columns: Column<MarketplaceItem>[] = [
    {
      key: 'title',
      header: 'Judul & Artis',
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.colorGradient} flex items-center justify-center text-white shrink-0 shadow-2xs font-bold text-xs`}
          >
            <Music className="w-5 h-5 opacity-90" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block text-xs">
              {m.title}
            </span>
            <span className="text-[11px] text-slate-500">{m.artist}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      sortable: true,
      render: (m) => (
        <span className="text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
          {m.category}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Harga',
      sortable: true,
      align: 'right',
      render: (m) => (
        <span
          className={`font-mono text-xs font-bold ${
            m.isFree ? 'text-emerald-700' : 'text-slate-900'
          }`}
        >
          {m.isFree ? 'Gratis' : formatRupiah(m.price)}
        </span>
      ),
    },
    {
      key: 'downloadsCount',
      header: 'Diunduh',
      sortable: true,
      align: 'center',
      render: (m) => (
        <span className="font-mono text-xs text-slate-600">
          {m.downloadsCount.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'usesCount',
      header: 'Dipakai Aktif',
      sortable: true,
      align: 'center',
      render: (m) => (
        <span className="font-mono text-xs text-slate-600">
          {m.usesCount.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'isVisible',
      header: 'Tampil',
      align: 'center',
      render: (m) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isAllowedToManage) handleToggleVisibility(m);
          }}
          disabled={!isAllowedToManage}
          className={`p-1.5 rounded-lg border transition-colors ${
            !isAllowedToManage
              ? 'opacity-40 cursor-not-allowed'
              : m.isVisible
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
          }`}
          title={m.isVisible ? 'Konten Aktif' : 'Disembunyikan'}
        >
          {m.isVisible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Konten Marketplace MViCall
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Katalog video ringtone resmi, lagu berlisensi, efek suara, dan urutan konten rekomendasi unggulan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reorder Featured Button */}
          {isAllowedToManage && (
            <button
              onClick={() => setIsReorderModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Atur Unggulan ({featuredItems.length})</span>
            </button>
          )}

          {/* Add Content Button */}
          {isAllowedToManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1F4E79] hover:bg-[#163a5c] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Konten</span>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg ml-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Grid Thumbnail"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel Detail"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari judul lagu, artis, atau tag..."
        searchValue={search}
        onSearchChange={setSearch}
        statusOptions={categories.map((c) => ({ label: c, value: c }))}
        selectedStatus={categoryFilter}
        onStatusChange={setCategoryFilter}
        productOptions={[
          { label: 'Gratis', value: 'free' },
          { label: 'Berbayar (Rp3.000)', value: 'paid' },
        ]}
        selectedProduct={priceFilter}
        onProductChange={setPriceFilter}
        hasActiveFilters={Boolean(
          search || categoryFilter !== 'all' || priceFilter !== 'all'
        )}
        onReset={() => {
          setSearch('');
          setCategoryFilter('all');
          setPriceFilter('all');
        }}
      />

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all ${
                !item.isVisible ? 'opacity-65' : ''
              }`}
            >
              <div>
                {/* Colored placeholder video thumbnail with duration & featured badge */}
                <div
                  className={`h-36 bg-gradient-to-br ${item.colorGradient} p-3 flex flex-col justify-between relative text-white`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/35 backdrop-blur-xs px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        Unggulan #{item.featuredOrder}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-md">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="bg-black/40 px-1.5 py-0.5 rounded">
                      00:{item.durationSec}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        item.isFree
                          ? 'bg-emerald-600 text-white'
                          : 'bg-black/50 text-amber-300'
                      }`}
                    >
                      {item.isFree ? 'Gratis' : formatRupiah(item.price)}
                    </span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{item.artist}</p>

                  <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3 text-slate-400" />
                      {item.downloadsCount.toLocaleString('id-ID')}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-slate-400" />
                      {item.usesCount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom toggle bar */}
              <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`text-[11px] font-medium ${
                    item.isVisible ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {item.isVisible ? 'Aktif di Katalog' : 'Disembunyikan'}
                </span>
                <button
                  onClick={() => isAllowedToManage && handleToggleVisibility(item)}
                  disabled={!isAllowedToManage}
                  className={`p-1 rounded-md border transition-colors ${
                    !isAllowedToManage
                      ? 'opacity-40 cursor-not-allowed'
                      : item.isVisible
                      ? 'bg-white text-slate-600 hover:text-slate-900'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                  title={item.isVisible ? 'Sembunyikan konten' : 'Tampilkan konten'}
                >
                  {item.isVisible ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <DataTable
          data={filteredItems}
          columns={columns}
          keyExtractor={(m) => m.id}
          pageSize={10}
        />
      )}

      {/* Add Content Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#1F4E79]/10 text-[#1F4E79] rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tambah Video Ringtone Baru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unggah media videotone untuk katalog resmi marketplace
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Fake Video Upload Dropzone */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  File Video Ringtone (MP4 9:16 Vertikal) <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => setFakeUploadedFile('video_sample_master_mvicall.mp4')}
                  className="border-2 border-dashed border-slate-300 hover:border-[#1F4E79] bg-slate-50 hover:bg-slate-100/70 rounded-xl p-5 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  {fakeUploadedFile ? (
                    <div>
                      <span className="font-semibold text-emerald-700 block">
                        ✓ {fakeUploadedFile} (14.2 MB)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Durasi otomatis: 28 Detik · Resolusi 1080x1920
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-slate-700">
                        Klik untuk simulasi unggah file video
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Format didukung: MP4, H.264, maks 30 detik (15 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Ringtone
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Sialan (Cover Akustik)"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Artis / Pencipta
                </label>
                <input
                  type="text"
                  value={formArtist}
                  onChange={(e) => setFormArtist(e.target.value)}
                  placeholder="Contoh: Mahalini"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Musik
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Skema Harga
                  </label>
                  <select
                    value={formPriceType}
                    onChange={(e) => setFormPriceType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
                  >
                    <option value="paid">Berbayar (Rp3.000)</option>
                    <option value="free">Gratis (Promo / Free)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded text-[#1F4E79]"
                  />
                  <span className="font-semibold text-slate-700">
                    Sematkan ke Bagian Unggulan (Featured)
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#1F4E79] hover:bg-[#163a5c] text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Lanjut ke Konfirmasi Publikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reorder Unggulan Modal */}
      {isReorderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Urutan Konten Unggulan (Featured)
                </h3>
              </div>
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-2 overflow-y-auto flex-1">
              <p className="text-xs text-slate-500 mb-3">
                Gunakan panah ke atas/bawah untuk menyesuaikan posisi slot prioritas video unggulan pada beranda aplikasi MViCall.
              </p>
              {featuredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#1F4E79] text-white flex items-center justify-center font-bold text-xs font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveFeatured(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded border border-slate-300 hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      title="Geser ke atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveFeatured(idx, 'down')}
                      disabled={idx === featuredItems.length - 1}
                      className="p-1 rounded border border-slate-300 hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      title="Geser ke bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
