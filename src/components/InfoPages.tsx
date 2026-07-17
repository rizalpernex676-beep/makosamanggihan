import React, { useState } from 'react';
import { Search, Filter, BookOpen, Clock, Heart, Eye, ArrowLeft, ArrowRight, HelpCircle, Mail, Phone, MapPin, MessageCircle, FileText, Shield, CheckCircle, Truck, Package, Clock as ClockIcon, Sparkles, User } from 'lucide-react';
import { Product, Article, FAQ, SiteSettings } from '../types';
import { ScrollReveal } from './ScrollReveal';

interface KatalogProdukPageProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onOrderNow: (product: Product, qty: number) => void;
}

export const KatalogProdukPage: React.FC<KatalogProdukPageProps> = ({ products, onViewProduct, onOrderNow }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'pupuk' | 'briket'>('semua');
  const [sortBy, setSortBy] = useState<'nama' | 'harga-rendah' | 'harga-tinggi' | 'stok'>('nama');

  const filtered = products
    .filter(p => p.isActive)
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedCategory === 'semua') return matchSearch;
      if (selectedCategory === 'pupuk') return matchSearch && p.name.toLowerCase().includes('pupuk');
      if (selectedCategory === 'briket') return matchSearch && (p.name.toLowerCase().includes('briket') || p.name.toLowerCase().includes('arang'));
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'nama') return a.name.localeCompare(b.name);
      if (sortBy === 'harga-rendah') return a.price - b.price;
      if (sortBy === 'harga-tinggi') return b.price - a.price;
      if (sortBy === 'stok') return b.stock - a.stock;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 font-sans">
      <ScrollReveal>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#154212] mb-3">Katalog Produk Unggulan</h1>
          <p className="text-zinc-600">Jelajahi berbagai pilihan pupuk organik premium dan briket batok kelapa ramah lingkungan berkualitas ekspor dari MAKOSA.</p>
        </div>
      </ScrollReveal>

      {/* Filters & Search */}
      <ScrollReveal>
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari pupuk atau briket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {(['semua', 'pupuk', 'briket'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#154212] text-white border-transparent'
                    : 'bg-white hover:bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
            <Filter className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#154212]/20"
            >
              <option value="nama">Nama Produk (A-Z)</option>
              <option value="harga-rendah">Harga Terendah</option>
              <option value="harga-tinggi">Harga Tertinggi</option>
              <option value="stok">Stok Terbanyak</option>
            </select>
          </div>
        </div>
      </ScrollReveal>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <ScrollReveal>
          <div className="text-center py-16 bg-zinc-50 border border-zinc-100 rounded-2xl">
            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">Tidak ada produk yang cocok dengan pencarian Anda.</p>
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal staggerChildren={true} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((prod) => (
            <div key={prod.id} className="group bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
              <div className="relative aspect-square bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => onViewProduct(prod)}>
                <img
                  src={prod.images[0] || undefined}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {prod.stock <= 0 ? (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Stok Habis</span>
                ) : prod.stock <= 5 ? (
                  <span className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Stok Menipis ({prod.stock})</span>
                ) : null}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[10px] font-extrabold text-[#154212] uppercase tracking-wider bg-[#154212]/5 px-2.5 py-1 rounded-full self-start mb-3">
                  {prod.name.toLowerCase().includes('briket') || prod.name.toLowerCase().includes('arang') ? 'Briket Batok' : 'Pupuk Organik'}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#154212] transition-colors line-clamp-1 cursor-pointer" onClick={() => onViewProduct(prod)}>{prod.name}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-2 flex-grow">{prod.description}</p>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase block">Harga</span>
                    <span className="text-lg font-extrabold text-zinc-950">Rp {prod.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewProduct(prod)}
                      className="px-3 py-2 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => onOrderNow(prod, 1)}
                      disabled={prod.stock <= 0}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#154212] hover:bg-[#0f320d] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      Beli
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollReveal>
      )}
    </div>
  );
};

interface ArtikelTerbaruPageProps {
  articles: Article[];
}

export const ArtikelTerbaruPage: React.FC<ArtikelTerbaruPageProps> = ({ articles }) => {
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'edukasi' | 'pertanian' | 'briket'>('semua');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['semua', 'edukasi', 'pertanian', 'briket'];

  const publishedArticles = articles.filter(art => art.isPublished);

  // Filtered list
  const filtered = publishedArticles
    .filter(art => {
      const matchesCategory = selectedCategory === 'semua' || art.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            art.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pick the newest article as Featured Post if no search or category filter is active
  const featuredArticle = publishedArticles.length > 0 ? publishedArticles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : null;
  const secondaryArticles = featuredArticle ? filtered.filter(art => art.id !== featuredArticle.id) : filtered;

  // Calculate read time
  const getReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 200));
    return `${time} menit baca`;
  };

  if (activeArticle) {
    // Recommendations excluding currently viewed article
    const recommended = publishedArticles
      .filter(art => art.id !== activeArticle.id)
      .slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 font-sans">
        <ScrollReveal>
          <button
            onClick={() => {
              setActiveArticle(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-xs font-bold text-[#154212] bg-[#154212]/5 hover:bg-[#154212]/10 px-4 py-2.5 rounded-xl transition-all mb-10 border border-[#154212]/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Artikel &amp; Edukasi</span>
          </button>
        </ScrollReveal>

        {/* Article Header */}
        <ScrollReveal className="space-y-6 mb-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#154212]/10 text-[#154212] rounded-full text-xs font-bold uppercase tracking-wider">
            {activeArticle.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            {activeArticle.title}
          </h1>

          {/* Author Meta Details */}
          <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
            <div className="w-10 h-10 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-sm shadow-inner uppercase">
              {activeArticle.category.slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">Tim Redaksi MAKOSA</p>
              <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {new Date(activeArticle.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  {activeArticle.views + 1} Dilihat
                </span>
                <span>•</span>
                <span className="text-green-800 font-semibold">{getReadTime(activeArticle.content)}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Grande Visual Spotlight */}
        <ScrollReveal className="relative aspect-[16/9] bg-zinc-100 rounded-3xl overflow-hidden shadow-xl mb-12 border border-zinc-200">
          <img
            src={activeArticle.coverImage || undefined}
            alt={activeArticle.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
        </ScrollReveal>

        {/* Main Editorial Content Body */}
        <ScrollReveal className="prose prose-zinc max-w-none text-zinc-800 leading-relaxed text-base md:text-lg space-y-8 font-serif">
          {activeArticle.content.split('\n\n').map((paragraph, index) => {
            // Give a visually gorgeous pull quote layout to paragraph starting with "Atau" / similar
            const isShortQuote = paragraph.length < 120 && index === Math.floor(activeArticle.content.split('\n\n').length / 2);
            if (isShortQuote) {
              return (
                <blockquote key={index} className="border-l-4 border-green-800 bg-green-800/5 px-6 py-4 rounded-r-xl italic font-serif text-green-900 font-medium text-lg my-6">
                  "{paragraph}"
                </blockquote>
              );
            }
            return (
              <p key={index} className="text-zinc-700">
                {index === 0 ? (
                  <span className="float-left text-5xl md:text-6xl font-bold font-sans text-green-800 mr-2.5 mt-1.5 leading-none">
                    {paragraph.charAt(0)}
                  </span>
                ) : null}
                {index === 0 ? paragraph.slice(1) : paragraph}
              </p>
            );
          })}
        </ScrollReveal>

        {/* Read Next / Recommendations Section */}
        {recommended.length > 0 && (
          <div className="mt-20 pt-12 border-t border-zinc-200 space-y-8">
            <h3 className="text-2xl font-bold text-zinc-950 font-sans tracking-tight">Baca Artikel Lainnya</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommended.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    setActiveArticle(art);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-50">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow space-y-2">
                    <span className="text-[9px] font-extrabold text-[#154212] uppercase tracking-wider">{art.category}</span>
                    <h4 className="text-sm font-bold text-zinc-900 group-hover:text-green-800 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 font-sans">
      <ScrollReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#154212]/10 text-[#154212] rounded-full text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Kanal Literasi Desa
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#154212]">Artikel &amp; Edukasi Terbaru</h1>
        <p className="text-zinc-600 text-sm md:text-base leading-relaxed">
          Temukan panduan lengkap bertani organik, pemanfaatan briket batok kelapa ramah lingkungan, serta berita inisiatif hijau dari MAKOSA Desa Manggihan.
        </p>
      </ScrollReveal>

      {/* Featured Editorial Spotlight Header */}
      {featuredArticle && selectedCategory === 'semua' && !searchQuery && (
        <ScrollReveal className="mb-16">
          <div 
            onClick={() => {
              setActiveArticle(featuredArticle);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group relative bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
          >
            <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden min-h-[300px]">
              <img
                src={featuredArticle.coverImage}
                alt={featuredArticle.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:hidden" />
            </div>

            <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center space-y-6 bg-white">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-800 border border-green-200/50 rounded-full text-xs font-bold uppercase tracking-wider self-start">
                ⭐ SOROTAN UTAMA
              </span>
              
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-950 leading-tight group-hover:text-green-800 transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                  {featuredArticle.content.replace(/<[^>]*>/g, '')}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-400 font-bold uppercase tracking-wider pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(featuredArticle.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span>•</span>
                <span className="text-green-800">{getReadTime(featuredArticle.content)}</span>
              </div>

              <span className="text-green-800 font-bold text-sm inline-flex items-center gap-1.5 pt-2 group-hover:gap-2.5 transition-all">
                Baca Selengkapnya
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Advanced Search & Category Filters */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari topik pertanian, edukasi, briket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800/10 focus:border-green-800 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedCategory === cat
                  ? 'bg-green-800 text-white border-transparent shadow-md shadow-green-800/15'
                  : 'bg-white hover:bg-zinc-100 text-zinc-600 border-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 border border-zinc-200 rounded-3xl">
          <BookOpen className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-800">Tidak ada artikel ditemukan</h3>
          <p className="text-zinc-500 text-sm mt-1">Coba gunakan kata kunci pencarian atau kategori filter lainnya.</p>
        </div>
      ) : (
        <ScrollReveal staggerChildren={true} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {secondaryArticles.map((art) => {
            const cleanExcerpt = art.content.replace(/<[^>]*>/g, '').substring(0, 140) + '...';
            return (
              <div 
                key={art.id} 
                onClick={() => {
                  setActiveArticle(art);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                <div className="relative aspect-[16/10] bg-zinc-100 overflow-hidden border-b border-zinc-100">
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-green-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow border border-white/20">
                    {art.category}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow space-y-3">
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(art.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span className="text-green-800">{getReadTime(art.content)}</span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-green-800 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  
                  <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed flex-grow">
                    {cleanExcerpt}
                  </p>

                  <div className="flex items-center text-xs font-bold text-green-800 pt-3 group-hover:translate-x-1 transition-transform self-start border-t border-zinc-100 w-full">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollReveal>
      )}
    </div>
  );
};

interface PusatFAQPageProps {
  faqs: FAQ[];
  settings: SiteSettings;
}

export const PusatFAQPage: React.FC<PusatFAQPageProps> = ({ faqs, settings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 font-sans">
      <ScrollReveal>
        <div className="text-center mb-12">
          <HelpCircle className="w-12 h-12 text-[#154212] mx-auto mb-3" />
          <h1 className="text-4xl font-extrabold tracking-tight text-[#154212] mb-3">Pusat Bantuan &amp; FAQ</h1>
          <p className="text-zinc-600 max-w-2xl mx-auto">Kami siap membantu Anda. Cari jawaban cepat seputar pemesanan produk, sistem pengiriman, metode pembayaran, dan konsultasi produk MAKOSA.</p>
        </div>
      </ScrollReveal>

      {/* Search Input */}
      <ScrollReveal>
        <div className="relative mb-10 max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari pertanyaan Anda di sini..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-3.5 bg-white border border-zinc-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition-all"
          />
        </div>
      </ScrollReveal>

      {/* FAQ list */}
      <ScrollReveal staggerChildren={true} className="space-y-4 mb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-zinc-50 border border-zinc-100 rounded-2xl">
            <p className="text-zinc-500 font-medium">Tidak ada hasil yang ditemukan untuk pencarian Anda.</p>
          </div>
        ) : (
          filtered.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id} 
                className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left font-bold text-zinc-900 hover:text-[#154212] transition-colors focus:outline-none"
                >
                  <span className="text-sm md:text-base pr-4">{faq.question}</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-100 font-bold transition-transform text-zinc-500 text-sm ${isOpen ? 'rotate-180 bg-[#154212]/5 text-[#154212]' : ''}`}>
                    ↓
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100/50 bg-zinc-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </ScrollReveal>

      {/* Support channels card */}
      <ScrollReveal>
        <div className="bg-[#154212]/5 border border-[#154212]/10 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-[#154212] mb-2">Masih memiliki pertanyaan?</h3>
          <p className="text-zinc-600 text-sm mb-6">Jika Anda tidak dapat menemukan jawaban dari pertanyaan Anda, silakan hubungi tim dukungan pelanggan kami secara langsung.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`https://wa.me/62${settings.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              <span>WhatsApp CS (24 Jam)</span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              <Mail className="w-4.5 h-4.5" />
              <span>Kirim Email</span>
            </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export const KebijakanPrivasiPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 font-sans">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-[#154212]" />
          <h1 className="text-3xl font-extrabold tracking-tight text-[#154212]">Kebijakan Privasi</h1>
        </div>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-8">Terakhir Diperbarui: 14 Juli 2026</p>

        <div className="prose prose-zinc max-w-none text-zinc-600 text-sm space-y-6 leading-relaxed">
          <p>
            Selamat datang di platform MAKOSA. Kami sangat menghargai kepercayaan Anda dan berkomitmen penuh untuk melindungi privasi serta keamanan data pribadi Anda selaku pengguna platform kami. Kebijakan Privasi ini dirancang untuk menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan menjaga informasi Anda saat berbelanja di website kami.
          </p>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">1. Informasi yang Kami Kumpulkan</h3>
            <p className="mb-2">Kami mengumpulkan beberapa jenis data pribadi saat Anda melakukan transaksi atau masuk menggunakan akun Google Anda, meliputi:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Data Profil Pengguna:</strong> Nama lengkap, alamat surat elektronik (email), foto profil, nomor telepon aktif, dan alamat pengiriman lengkap Anda.</li>
              <li><strong>Data Transaksi &amp; Pengiriman:</strong> Detail produk yang dibeli, kuantitas, estimasi ongkos kirim, detail kurir pilihan, nomor resi pengiriman, serta status riwayat pesanan.</li>
              <li><strong>Data Pembayaran:</strong> Identifikasi transaksi pembayaran eksternal yang diproses secara aman oleh gateway pembayaran berlisensi (Midtrans). Kami tidak pernah menyimpan data rahasia kartu kredit Anda secara langsung.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">2. Penggunaan Informasi Anda</h3>
            <p className="mb-2">Semua informasi pribadi yang kami peroleh digunakan semata-mata untuk tujuan:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Memproses dan memvalidasi pesanan Anda secara real-time.</li>
              <li>Menghitung estimasi biaya pengiriman berdasarkan koordinat wilayah pengiriman.</li>
              <li>Mengirimkan notifikasi pembaruan status pengiriman (diproses, dikirim, selesai) ke akun Anda.</li>
              <li>Memudahkan proses koordinasi pengiriman oleh kurir pihak ketiga.</li>
              <li>Meningkatkan kualitas layanan situs web dan melacak performa produk unggulan.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">3. Keamanan Informasi</h3>
            <p>
              MAKOSA menggunakan infrastruktur basis data cloud terenkripsi (Google Cloud &amp; Firestore) yang dilengkapi dengan aturan keamanan yang ketat. Hanya pengguna sah pemilik data dan tim administrator MAKOSA terverifikasi yang diberikan hak akses untuk membaca dan memodifikasi data transaksi tersebut.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">4. Hak Pengguna</h3>
            <p>
              Anda memiliki hak penuh untuk memperbarui informasi profil pribadi Anda (nama, nomor handphone, alamat pengiriman) secara langsung kapan saja melalui menu Profil Saya di website MAKOSA. Kami menjamin kebebasan akses informasi Anda.
            </p>
          </div>

          <div className="border-t border-zinc-100 pt-6 mt-8">
            <p className="text-xs text-zinc-500 italic">
              Dengan bertransaksi dan menggunakan layanan MAKOSA, Anda dianggap setuju dan memberikan izin atas pengumpulan serta pengolahan informasi pribadi Anda sesuai dengan ketentuan Kebijakan Privasi ini.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export const SyaratKetentuanPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 font-sans">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-[#154212]" />
          <h1 className="text-3xl font-extrabold tracking-tight text-[#154212]">Syarat &amp; Ketentuan</h1>
        </div>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-8">Terakhir Diperbarui: 14 Juli 2026</p>

        <div className="prose prose-zinc max-w-none text-zinc-600 text-sm space-y-6 leading-relaxed">
          <p>
            Ketentuan Layanan berikut ini mengikat seluruh pengunjung dan pembeli produk di website MAKOSA. Silakan baca dokumen ini dengan seksama sebelum melakukan pemesanan produk pupuk organik atau briket batok kelapa kami.
          </p>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">1. Ketentuan Pemesanan</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pembeli wajib login dengan akun Google aktif untuk mencatat riwayat pesanan demi akurasi data.</li>
              <li>Pembeli bertanggung jawab penuh atas keakuratan alamat pengiriman dan nomor handphone yang dituliskan saat pengisian form Checkout.</li>
              <li>Pesanan yang sudah dibuat akan berstatus "Menunggu Konfirmasi" sampai divalidasi oleh Admin MAKOSA.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">2. Sistem Pengiriman &amp; Ongkos Kirim</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Biaya pengiriman dihitung secara otomatis berdasarkan wilayah/kecamatan tujuan pengiriman menggunakan estimasi tarif logistik resmi.</li>
              <li>MAKOSA berhak mengubah status pengiriman menjadi "Dikirim" dan mencantumkan nama kurir serta nomor resi pelacakan yang valid.</li>
              <li>Waktu sampai pengiriman sepenuhnya bergantung pada performa operasional penyedia jasa kurir pihak ketiga yang dipilih.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">3. Batasan Pembatalan &amp; Pengembalian</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pesanan yang telah memasuki status "Diproses" atau "Dikirim" oleh Admin tidak dapat dibatalkan secara sepihak oleh pembeli.</li>
              <li>Pengembalian barang atau klaim kerusakan hanya dilayani jika pembeli menyertakan video pembukaan paket (unboxing) yang utuh tanpa jeda dalam waktu maksimal 2x24 jam sejak barang diterima.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">4. Hak Kepemilikan Intelektual</h3>
            <p>
              Seluruh aset media, konten artikel, desain logo, merek MAKOSA, serta deskripsi produk merupakan hak cipta eksklusif MAKOSA dan dilindungi oleh Undang-Undang Hak Cipta Republik Indonesia.
            </p>
          </div>

          <div className="border-t border-zinc-100 pt-6 mt-8">
            <p className="text-xs text-zinc-500 italic">
              MAKOSA berhak memperbarui dokumen Syarat &amp; Ketentuan ini sewaktu-waktu tanpa pemberitahuan tertulis sebelumnya demi penyesuaian regulasi hukum dan peningkatan kualitas operasional bisnis kami.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
