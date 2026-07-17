import React from 'react';
import { ChevronLeft, Star, ShoppingBag, Heart, Share2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ScrollReveal } from './ScrollReveal';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onOrderNow: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  onBack,
  onOrderNow,
  onViewProduct
}) => {
  const [activeImg, setActiveImg] = React.useState(product.images[0] || '');
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    setActiveImg(product.images[0] || '');
    setQty(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const handleOrderNow = () => {
    onOrderNow(product, qty);
  };

  const totalPrice = product.price * qty;

  // Find related products
  const relatedProducts = allProducts.filter(p => p.id !== product.id && p.isActive);

  // Agricultural benefits list
  const benefits = product.benefits && product.benefits.length > 0
    ? product.benefits
    : (product.id === 'kompos-blok' ? [
        '100% Organik & Alami',
        'Nutrisi Makro & Mikro Lengkap',
        'Meningkatkan Retensi Air Tanah',
        'Anti Jamur & Patogen Jahat',
        'Formula Slow-Release Efisien',
        'Memperkuat Struktur Akar'
      ] : [
        'Daya Bakar Sangat Tinggi',
        'Panas Stabil & Tahan Lama',
        'Rendah Asap & Bebas Bau',
        '100% Ramah Lingkungan',
        'Menghemat Biaya Gas & Listrik',
        'Abu Pembakaran Sangat Sedikit'
      ]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 animate-in fade-in duration-300 font-sans">
      {/* Breadcrumb & Back action */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#154212] font-semibold text-sm mb-8 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Kembali ke Katalog</span>
      </button>

      {/* Main product presentation columns */}
      <ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          {/* Left: Product Images */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl overflow-hidden bg-zinc-50 aspect-square sm:aspect-[4/3] relative shadow-sm border border-zinc-200">
              {activeImg ? (
                <img 
                  className="w-full h-full object-cover transition-all" 
                  src={activeImg} 
                  alt={product.name} 
                />
              ) : (
                <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400">Tidak ada gambar</div>
              )}
              <span className="absolute top-4 left-4 bg-[#154212] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Pilihan Utama
              </span>
            </div>

            {/* Small thumbnail sliders */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(img)}
                    className={`w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === img 
                        ? 'border-[#154212] scale-95 shadow-sm' 
                        : 'border-zinc-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {img ? (
                      <img src={img || undefined} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">No Img</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product specs and checkout controls */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#154212] mb-2 font-display">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 text-zinc-500 mb-4">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-semibold border-l border-zinc-200 pl-4 text-zinc-600">
                  Rating 5.0 (Reviewer Terpercaya)
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Stok: {product.stock} pcs
                </span>
              </div>

              <div className="text-3xl font-extrabold text-[#154212]">
                Rp {product.price.toLocaleString('id-ID')}
                <span className="text-sm font-normal text-zinc-500"> / unit</span>
              </div>
            </div>

            <div className="h-[1px] bg-zinc-200 w-full"></div>

            {/* Description and benefits check */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#154212] font-display">Deskripsi &amp; Manfaat</h3>
              <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
                {product.description}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-2">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-zinc-700 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#154212] flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-[1px] bg-zinc-200 w-full"></div>

            {/* Shopping count stepper panel */}
            <div className="p-6 bg-white rounded-2xl border border-zinc-200">
              <label className="block text-sm font-semibold text-zinc-600 mb-3">Jumlah Pembelian</label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center bg-white border border-zinc-300 rounded-lg">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2 hover:bg-zinc-50 text-zinc-700 font-bold transition-colors"
                  >
                    -
                  </button>
                  <input 
                    className="w-14 text-center border-none focus:ring-0 font-bold text-zinc-900 bg-transparent" 
                    type="number" 
                    value={qty} 
                    min="1"
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-2 hover:bg-zinc-50 text-zinc-700 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={handleOrderNow}
                  className="flex-1 bg-[#154212] hover:bg-[#2d5a27] text-white py-4 px-6 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  <span>Pesan Sekarang</span>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-zinc-500 text-sm">
                <span>Total Estimasi Pembayaran:</span>
                <span className="font-bold text-lg text-[#154212]">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-zinc-500 text-xs font-medium mt-1">
              <button className="flex items-center gap-1.5 hover:text-[#154212] transition-colors">
                <Heart className="w-4 h-4" />
                <span>Tambah ke Wishlist</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#154212] transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Bagikan Link</span>
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Cross selling: Related products */}
      {relatedProducts.length > 0 && (
        <ScrollReveal>
          <section className="mt-16 pt-16 border-t border-zinc-200">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs font-bold text-[#154212] uppercase tracking-widest">Sinergi Produk</span>
                <h2 className="text-2xl md:text-3xl font-bold font-display">Produk Terkait</h2>
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="text-sm font-bold text-[#154212] hover:underline flex items-center gap-1">
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((relProd) => (
                <div 
                  key={relProd.id}
                  className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col h-full"
                  onClick={() => onViewProduct(relProd)}
                >
                  <div className="h-48 overflow-hidden bg-zinc-50 relative">
                    <img src={relProd.images[0] || undefined} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={relProd.name} />
                  </div>
                  <div className="p-5 flex flex-col flex-grow space-y-3">
                    <h4 className="font-bold text-zinc-900 group-hover:text-[#154212] transition-colors">{relProd.name}</h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-grow">{relProd.description}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-bold text-[#154212]">Rp {relProd.price.toLocaleString('id-ID')}</span>
                      <span className="text-xs font-bold text-[#154212] flex items-center gap-1 group-hover:underline">
                        Detail →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}
    </div>
  );
};
export default ProductDetailView;
