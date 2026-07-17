import React from 'react';
import { Leaf, Award, Shield, ArrowRight, Star, ShoppingCart, CheckCircle, Flame, Eye, Calendar, Plus, Tag, HelpCircle, Heart } from 'lucide-react';
import { Product, Article, FAQ, HomepageSection, SiteSettings } from '../types';
import { motion } from 'motion/react';
import { ScrollReveal } from './ScrollReveal';

interface HomepageViewProps {
  products: Product[];
  articles: Article[];
  faqs: FAQ[];
  sections: HomepageSection[];
  settings: SiteSettings;
  onViewProduct: (product: Product) => void;
  onOrderNow: (product: Product, qty: number) => void;
  onNavigate: (view: string) => void;
}

export const HomepageView: React.FC<HomepageViewProps> = ({
  products,
  articles,
  faqs,
  sections,
  settings,
  onViewProduct,
  onOrderNow,
  onNavigate
}) => {
  const [activeFaq, setActiveFaq] = React.useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null);
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const updateQty = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // Fallback defaults if sections is empty
  const heroSec = sections.find(s => s.type === 'hero') || {
    title: 'Solusi Energi Berkelanjutan untuk Desa',
    subtitle: 'Mengubah limbah organik menjadi briket berkualitas tinggi dan kompos premium untuk masa depan hijau Indonesia.',
    buttonText: 'Jelajahi Produk',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7UmjNUou828wbbM3py2XJhaWxRhbZNhTtf7yimBCotgjfkpGamV6-nmkzOTnTDBqc8daZFtfgOXAgBRb6jozb2cXCWtEPNdSnWIySv9fcwsltgTEjy0alYbgvrS-Fue2S0jU852mKnSF2pv121MjEbOwoPuKDq3ajyugyAnEniV-SkVheIFdkU-iX9Sl9UEwxV016oKEvHtEhcFmANFA6OxpZ_xj_hBV6xaqHt6cCNqA8zZul4ZlF',
    heroMedia: []
  };

  const aboutSec = sections.find(s => s.type === 'about') || {
    title: 'Tentang Program MAKOSA',
    subtitle: 'MAKOSA adalah inisiatif keberlanjutan Desa Manggihan untuk mengelola sampah secara mandiri dan menciptakan ekonomi sirkular. Kami percaya bahwa setiap limbah yang dihasilkan oleh desa dapat dikembalikan ke alam dalam bentuk yang lebih bermanfaat.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCinpHS8S_bFEO4QL_0c3uBPycXM395-QGvXL7ls7yMr1B8KP5noFeKOd4fB5ruY58ubJrJEjsScnOk-jnZnUJMBMAgItqVyjpAGU6bS7uYEyNkIsu4asuOMnQlBOKHSOahfuX9DwJfc6njP8XIpbHVG_N8VxOTSAWmGQ5V9ZDHDXfvMKxritKvjOpZzaAYOtiqSKpqt9K6DKqBazUoQgXpLQfW9EJ-pNR9YtwE8SapvdN6O5dZq_qF'
  };

  const mediaList = React.useMemo(() => {
    if (heroSec.heroMedia && heroSec.heroMedia.length > 0) {
      return [...heroSec.heroMedia].sort((a, b) => a.order - b.order);
    }
    return [
      {
        type: 'image' as const,
        url: heroSec.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7UmjNUou828wbbM3py2XJhaWxRhbZNhTtf7yimBCotgjfkpGamV6-nmkzOTnTDBqc8daZFtfgOXAgBRb6jozb2cXCWtEPNdSnWIySv9fcwsltgTEjy0alYbgvrS-Fue2S0jU852mKnSF2pv121MjEbOwoPuKDq3ajyugyAnEniV-SkVheIFdkU-iX9Sl9UEwxV016oKEvHtEhcFmANFA6OxpZ_xj_hBV6xaqHt6cCNqA8zZul4ZlF',
        order: 1
      }
    ];
  }, [heroSec.heroMedia, heroSec.image]);

  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (mediaList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % mediaList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mediaList.length]);

  const leftImages = React.useMemo(() => {
    return aboutSec.aboutImagesLeft && aboutSec.aboutImagesLeft.length > 0
      ? aboutSec.aboutImagesLeft
      : [
          'https://res.cloudinary.com/hr5roooz/image/upload/v1784220391/IMG_1887_lsybdl.jpg',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAD-KXiQgOCQYANtfatXYiu_ysTcBTkTDL0k7Bw0AUGcy8ZVdnwUZ4wklBasfwIvUpgadFfiiBpCCqtXNCS5nj94EkFTr8Gh4kIM7PGY8f9jE90GOin1ge4kh35-AT0FRIz-DiQT63Dk82e-1MlnvdQGJNlmkaca3y-jKDDxS3ZL7CIvK6adp6f0H8UT5cgONzlHybib1mTr9K7MDVYJu2pQW0YG0xn1sZ4XAKipbkuVa05ftuL7ONZ'
        ];
  }, [aboutSec.aboutImagesLeft]);

  const rightImages = React.useMemo(() => {
    return aboutSec.aboutImagesRight && aboutSec.aboutImagesRight.length > 0
      ? aboutSec.aboutImagesRight
      : [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAbxLn-aC4XWtMtZldST6vvSP8A0nhgeBxVspBbEVgWhO4Zs6ukcrSEjccXpudFf2BDqDWQsJLaE9Cj2veCKEvA7y8FKN974mMbZcxmyGIDDPj4xoPO0UNRTqKHTnbtunRjAjzGAe9JRqqbCx5wPg5vlKqKDgZ3JrmdfjzmlH8DXfIsFLQGOx4YOBNvXCYR9QbmxhbxYnYjVYoXZiAFKR2m0Nug8qW8deG8mHVcqCyncHBrfd-l-BF9',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB7UmjNUou828wbbM3py2XJhaWxRhbZNhTtf7yimBCotgjfkpGamV6-nmkzOTnTDBqc8daZFtfgOXAgBRb6jozb2cXCWtEPNdSnWIySv9fcwsltgTEjy0alYbgvrS-Fue2S0jU852mKnSF2pv121MjEbOwoPuKDq3ajyugyAnEniV-SkVheIFdkU-iX9Sl9UEwxV016oKEvHtEhcFmANFA6OxpZ_xj_hBV6xaqHt6cCNqA8zZul4ZlF'
        ];
  }, [aboutSec.aboutImagesRight]);

  const [leftIndex, setLeftIndex] = React.useState(0);
  const [rightIndex, setRightIndex] = React.useState(0);

  React.useEffect(() => {
    if (leftImages.length <= 1) return;
    const interval = setInterval(() => {
      setLeftIndex(prev => (prev + 1) % leftImages.length);
    }, 6000); // 6 seconds for left image
    return () => clearInterval(interval);
  }, [leftImages]);

  React.useEffect(() => {
    if (rightImages.length <= 1) return;
    const interval = setInterval(() => {
      setRightIndex(prev => (prev + 1) % rightImages.length);
    }, 8500); // 8.5 seconds for right image (different interval to prevent simultaneous sliding)
    return () => clearInterval(interval);
  }, [rightImages]);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Header Banner */}
      <header className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-black text-white">
        {/* Background Slides */}
        <div className="absolute inset-0 z-0">
          {mediaList.map((media, idx) => {
            const isActive = idx === currentSlide;
            const isVideo = media.type === 'video';
            return (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                } transform transition-all`}
              >
                {isVideo ? (
                  isActive ? (
                    <video
                      src={media.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-950" />
                  )
                ) : (
                  <img
                    src={media.url || undefined}
                    alt={`Hero Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                )}
              </div>
            );
          })}
          {/* Visual gradient overlay to ensure perfect contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#154212]/90 via-black/55 to-black/70 z-10"></div>
        </div>

        {/* Content Centered over Overlay */}
        <div className="relative max-w-4xl mx-auto px-6 text-center z-20 space-y-8">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur-md text-green-300 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 animate-pulse">
            <Leaf className="w-3.5 h-3.5" />
            Inisiatif Keberlanjutan
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight font-display text-white">
            {heroSec.title}
          </h1>

          <p className="text-zinc-200 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-sans font-light">
            {heroSec.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#produk"
              className="w-full sm:w-auto px-8 py-4 bg-[#154212] hover:bg-[#2d5a27] text-white font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-[#154212]/20 transition-all text-center border border-green-700/50"
            >
              Lihat Produk Kami
            </a>
            <a
              href="#tentang"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm rounded-lg transition-all text-center backdrop-blur-md"
            >
              Pelajari Program
            </a>
          </div>
        </div>

        {/* Slider Indicator Dots */}
        {mediaList.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {mediaList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </header>

      {/* Sustainable Impact Meter */}
      <ScrollReveal delay={100}>
        <section className="bg-[#154212] text-white py-12 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold font-headline">965 Ekor</p>
              <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-widest font-semibold">Potensi Sapi Perah Desa</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold font-headline">9 Ton</p>
              <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-widest font-semibold">Potensi Bio-Limbah Harian</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold font-headline">217+</p>
              <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-widest font-semibold">Peternak &amp; Petani Terbantu</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-bold font-headline">2 Produk</p>
              <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-widest font-semibold">Inovasi Ekologis Ternilai Jual</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* About Section */}
      <ScrollReveal>
        <section className="py-24 bg-white" id="tentang">
          <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden aspect-square shadow-md transform -rotate-3 hover:rotate-0 transition-transform duration-300 relative">
                  {leftImages.map((imgUrl, idx) => (
                    <img 
                      key={idx}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${idx === leftIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
                      src={imgUrl} 
                      alt={`Slide Left ${idx + 1}`} 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ))}
                </div>
                <div className="rounded-xl overflow-hidden aspect-square shadow-md transform translate-y-6 rotate-3 hover:rotate-0 transition-transform duration-300 relative">
                  {rightImages.map((imgUrl, idx) => (
                    <img 
                      key={idx}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${idx === rightIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
                      src={imgUrl} 
                      alt={`Slide Right ${idx + 1}`} 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-[#154212] font-display">
                {aboutSec.title}
              </h2>
              <p className="text-zinc-600 leading-relaxed text-sm md:text-base">
                {aboutSec.subtitle}
              </p>
              <p className="text-zinc-600 leading-relaxed text-sm md:text-base">
               Sebagai bentuk implementasi dari Program MAKOSA, kami mengembangkan dua produk olahan berbasis limbah kotoran sapi, yaitu kompos blok dan briket. Kedua produk ini dipilih karena memiliki nilai guna dan nilai ekonomi sehingga limbah yang sebelumnya menjadi sumber pencemaran dapat diubah menjadi produk yang bermanfaat.</p>
              <div className="space-y-3 pt-2">
                {[
                  'Pengurangan pembuangan sampah liar secara swadayReduksi Pencemaran Lingkungan: Mengurangi 57% limbah kotoran sapi yang terbuang ke aliran sungai hulu.',
                  'Menghasilkan Tanaman Berkualitas tinggi.',
                  '2 Produk Ekologis Bernilai Jual: Menghasilkan Kompos Blok, Briket bahan bakar alternatif.'
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#154212] mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-zinc-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Products Catalog Listing */}
      <section className="py-24 bg-white border-t border-b border-zinc-200" id="produk">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#154212] font-display">
                Produk Unggulan Kami
              </h2>
              <p className="text-zinc-600 max-w-xl mx-auto text-sm md:text-base">
                Gunakan produk ramah lingkungan hasil olahan Desa Manggihan berkualitas tinggi untuk pertanian dan energi alternatif Anda.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerChildren={true} className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto font-sans">
            {products.filter(p => p.isActive).map((product) => {
              const isKompos = product.id === 'kompos-blok';
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="relative h-64 overflow-hidden bg-zinc-50 cursor-pointer flex items-center justify-center" onClick={() => onViewProduct(product)}>
                    {product.images && product.images[0] ? (
                      <img 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        src={product.images[0] || undefined} 
                        alt={product.name} 
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-zinc-400 text-sm">No Image</span>
                    )}
                    {isKompos && (
                      <span className="absolute top-4 left-4 bg-[#154212] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Terlaris
                      </span>
                    )}
                    {product.stock <= 10 && (
                      <span className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Stok Menipis ({product.stock})
                      </span>
                    )}
                  </div>

                  <div className="p-8 flex flex-col flex-grow space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xl font-bold text-zinc-900 group-hover:text-[#154212] transition-colors cursor-pointer" onClick={() => onViewProduct(product)}>
                        {product.name}
                      </h3>
                      <span className="text-lg font-bold text-[#2d5a27] whitespace-nowrap">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-600 leading-relaxed flex-grow line-clamp-3">
                      {product.description}
                    </p>

                    <div className="pt-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
                        <span className="text-xs font-semibold text-zinc-500">Jumlah:</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateQty(product.id, -1); }}
                            className="w-7 h-7 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold rounded flex items-center justify-center transition-colors text-sm"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-6 text-center text-zinc-800">
                            {quantities[product.id] || 1}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateQty(product.id, 1); }}
                            className="w-7 h-7 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold rounded flex items-center justify-center transition-colors text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onViewProduct(product)}
                          className="px-4 py-3 border border-zinc-300 text-zinc-700 font-semibold text-xs rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                          Detail
                        </button>
                        <button 
                          onClick={() => onOrderNow(product, quantities[product.id] || 1)}
                          className="flex-1 bg-[#154212] hover:bg-[#2d5a27] text-white py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98"
                        >
                          Pesan Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollReveal>
        </div>
      </section>

      {/* Articles / News Feed Section */}
      <ScrollReveal>
        <section className="py-24 bg-white font-sans" id="artikel">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-16">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#154212] uppercase tracking-widest">
                  Kabar Terkini
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-[#154212] font-display">
                  Edukasi Lingkungan &amp; Aktivitas Desa
                </h2>
              </div>
            </div>

            <ScrollReveal staggerChildren={true} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.filter(a => a.isPublished).slice(0, 3).map((article) => (
                <div 
                  key={article.id} 
                  className="group cursor-pointer flex flex-col h-full bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-50">
                    <img 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src={article.coverImage || undefined} 
                      alt={article.title} 
                      loading="lazy"
                    />
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#154212] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow space-y-3">
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {article.views} views
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#154212] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-600 line-clamp-3 leading-relaxed flex-grow">
                      {article.content}
                    </p>
                    <span className="text-[#154212] font-bold text-xs inline-flex items-center gap-1 pt-2 group-hover:gap-2 transition-all">
                      Baca Selengkapnya
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>
      </ScrollReveal>

      {/* Collapsible FAQ Section */}
      <ScrollReveal>
        <section className="py-24 bg-white border-t border-zinc-200" id="faq font-sans">
          <div className="max-w-4xl mx-auto px-6 md:px-10 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold text-[#154212] uppercase tracking-widest flex items-center justify-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Tanya Jawab
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#154212] font-display">
                Frequently Asked Questions (FAQ)
              </h2>
              <p className="text-zinc-600 max-w-xl mx-auto text-sm md:text-base">
                Temukan jawaban atas pertanyaan umum terkait produk dan operasional MAKOSA Desa Manggihan.
              </p>
            </div>

            <div className="space-y-4 font-sans">
              {faqs.map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div 
                    key={faq.id}
                    className="bg-white border border-zinc-200 rounded-xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <span className="text-base font-bold text-zinc-900 pr-4">
                        {faq.question}
                      </span>
                      <span className={`p-1.5 rounded-full bg-zinc-100 text-zinc-700 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 border-t border-zinc-100 dark:border-zinc-850 animate-in fade-in slide-in-from-top-2 duration-350">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {faq.answer}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {faq.tags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded text-xs font-semibold">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Partners Grayscale Strip */}
      <ScrollReveal>
        <section className="py-16 bg-white border-t border-zinc-200">
          <div className="max-w-7xl mx-auto px-6 md:px-10 text-center space-y-8">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Mitra Kami &amp; Didukung Oleh
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 transition-all duration-300">
              <img 
                alt="Partner Logos" 
                className="h-16 md:h-24 lg:h-28 w-auto object-contain hover:scale-110 hover:brightness-110 active:scale-95 transition-all duration-500 cursor-pointer drop-shadow-sm" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN9dvbRouocMr47m4L0ftWmsEDRltxGrF0vicV7snl6JM9qvOb5drZhVr3G0m98YjvIUIZSyiei50yMCb0LvZealFZjM-SsR5z9uHN_XCiyllpOhQ2XnoUhJVgaNVp6qu8TzZuDD9et7u94Y0-z6HpJWDEfIE-Ir7kYmc4OuPowPRtwVZ6bFnwyi9af7V2DgrPOzghIG7Ydlu3Elnwx82CNDk-uRlYeQ4lRgVAc0hXYX8iIbcadynazc0v24h8DGmitQ" 
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Read Article Dialog Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <div 
            onClick={() => setSelectedArticle(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          ></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="relative h-64 overflow-hidden bg-zinc-50 flex-shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src={selectedArticle.coverImage || undefined} 
                alt={selectedArticle.title} 
              />
              <span className="absolute top-4 left-4 bg-[#154212] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {selectedArticle.category}
              </span>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-4">
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedArticle.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {selectedArticle.views} views
                </span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 leading-tight">
                {selectedArticle.title}
              </h3>
              <p className="text-zinc-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                {selectedArticle.content}
              </p>
            </div>
            
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-end flex-shrink-0 font-sans">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold text-sm rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HomepageView;
