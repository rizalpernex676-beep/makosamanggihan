import React from 'react';
import { MapPin, Phone, User, Search, Truck, Info, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { Product, CartItem, UserProfile } from '../types';
import { ScrollReveal } from './ScrollReveal';

interface CartAndCheckoutViewProps {
  cart: CartItem[];
  currentUser: UserProfile | null;
  settings: any;
  onUpdateQty?: (product: Product, delta: number) => void;
  onRemoveItem?: (product: Product) => void;
  onLogin: () => void;
  onCheckoutComplete: (
    shippingAddress: string,
    phone: string,
    fullName: string,
    shippingCost: number | null,
    courier: string,
    courierService: string,
    destinationAreaId: string
  ) => void;
  onNavigate: (view: string) => void;
}

export const CartAndCheckoutView: React.FC<CartAndCheckoutViewProps> = ({
  cart,
  currentUser,
  settings,
  onLogin,
  onCheckoutComplete,
  onNavigate
}) => {
  const [fullName, setFullName] = React.useState(currentUser?.name || '');
  const [phone, setPhone] = React.useState(currentUser?.phone || '');
  const [address, setAddress] = React.useState(currentUser?.address || '');
  const [loading, setLoading] = React.useState(false);

  const hasEmptyProfileAddress = currentUser && !currentUser.address;

  // RajaOngkir integration state
  const [destSearch, setDestSearch] = React.useState('');
  const [destResults, setDestResults] = React.useState<any[]>([]);
  const [searchingDest, setSearchingDest] = React.useState(false);
  const [selectedDest, setSelectedDest] = React.useState<any | null>(null);
  const [showDestDropdown, setShowDestDropdown] = React.useState(false);

  const [shippingRates, setShippingRates] = React.useState<any[]>([]);
  const [loadingRates, setLoadingRates] = React.useState(false);
  const [selectedRate, setSelectedRate] = React.useState<any | null>(null);

  // If cart is empty, redirect back or show empty state
  const orderItem = cart[0];

  // Sync profile details if available
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);

  // Debounced search for destination
  React.useEffect(() => {
    if (destSearch.trim().length < 3) {
      setDestResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setSearchingDest(true);
      try {
        const response = await fetch(`/api/destination/domestic-destination?search=${encodeURIComponent(destSearch)}`);
        if (response.ok) {
          const resJson = await response.json();
          if (resJson && resJson.data) {
            setDestResults(resJson.data);
          }
        }
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setSearchingDest(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [destSearch]);

  // Calculate weights & query rates when destination is selected
  React.useEffect(() => {
    if (!selectedDest || !orderItem) {
      setShippingRates([]);
      setSelectedRate(null);
      return;
    }

    const fetchRates = async () => {
      setLoadingRates(true);
      setSelectedRate(null);
      try {
        // Calculate total weight in grams (defaults to 1000g if undefined)
        const totalWeight = (orderItem.product.weight || 1000) * orderItem.quantity;
        const originId = settings?.originAreaId || '68244';
        const destId = selectedDest.subdistrict_id || selectedDest.id;

        const response = await fetch('/api/calculate/domestic-cost', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: originId,
            destination: destId,
            weight: totalWeight,
            courier: 'jne:jnt:sicepat'
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson && resJson.data) {
            const flatRates: any[] = [];
            resJson.data.forEach((courier: any) => {
              const code = courier.code || '';
              const name = courier.name || '';
              if (courier.costs && Array.isArray(courier.costs)) {
                courier.costs.forEach((srv: any) => {
                  const srvName = srv.service || '';
                  const description = srv.description || '';
                  const costValue = srv.cost?.[0]?.value || 0;
                  const etd = srv.cost?.[0]?.etd || '';
                  flatRates.push({
                    courierCode: code.toUpperCase(),
                    courierName: name,
                    service: srvName,
                    description,
                    cost: costValue,
                    etd
                  });
                });
              }
            });
            setShippingRates(flatRates);

            // Auto-select cheapest option if available
            if (flatRates.length > 0) {
              const cheapest = [...flatRates].sort((a, b) => a.cost - b.cost)[0];
              setSelectedRate(cheapest);
            }
          }
        }
      } catch (err) {
        console.error('Error calculating shipping rates:', err);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, [selectedDest, orderItem, settings]);

  if (!orderItem) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center font-sans">
        <h2 className="text-2xl font-bold text-zinc-800 mb-4">Belum ada produk yang dipilih</h2>
        <p className="text-zinc-600 mb-8">Silakan pilih produk unggulan kami di katalog untuk memesan.</p>
        <button
          onClick={() => onNavigate('home')}
          className="bg-[#154212] hover:bg-[#2d5a27] text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          Lihat Produk
        </button>
      </div>
    );
  }

  const subtotal = orderItem.product.price * orderItem.quantity;

  const cheapestRate = shippingRates.length > 0
    ? [...shippingRates].sort((a, b) => a.cost - b.cost)[0]
    : null;

  // Graceful client-side fallback cost in case RajaOngkir API fails or returns empty
  const totalWeight = (orderItem.product.weight || 1000) * orderItem.quantity;
  const fallbackCost = Math.round(15000 + (totalWeight / 1000) * 8000);
  const estimasiOngkir = cheapestRate ? cheapestRate.cost : fallbackCost;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert("Mohon lengkapi data penerima dan alamat pengiriman!");
      return;
    }
    if (!selectedDest) {
      alert("Mohon cari dan pilih kecamatan tujuan pengiriman!");
      return;
    }

    setLoading(true);
    // Proceed to place order
    const finalRate = selectedRate || cheapestRate;
    const courierCode = finalRate ? finalRate.courierCode : 'SICEPAT';
    const courierService = finalRate ? `${finalRate.service} (${finalRate.etd} hari)` : 'REG';
    const estCost = finalRate ? finalRate.cost : estimasiOngkir;

    onCheckoutComplete(
      `${address}, Kecamatan/Kota: ${selectedDest.label || selectedDest.subdistrict_name || selectedDest.city_name}`,
      phone,
      fullName,
      estCost,
      courierCode,
      courierService,
      String(selectedDest.subdistrict_id || selectedDest.id)
    );
    setLoading(false);
  };

  return (
    <ScrollReveal>
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-extrabold text-[#154212] tracking-tight font-display">
            Konfirmasi Pesanan
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            Selesaikan pengisian alamat untuk mengirim rincian pesanan langsung ke WhatsApp Admin MAKOSA.
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="text-zinc-600 hover:text-[#154212] font-semibold text-sm transition-colors flex items-center gap-1.5 self-start"
        >
          &larr; Kembali ke Beranda
        </button>
      </div>

      {!currentUser ? (
        <div className="bg-[#154212]/5 rounded-2xl border border-[#154212]/25 p-8 text-center max-w-2xl mx-auto space-y-6">
          <Info className="w-12 h-12 text-[#154212] mx-auto" />
          <h2 className="text-xl font-bold text-zinc-900">Masuk untuk Melanjutkan Pemesanan</h2>
          <p className="text-zinc-600 text-sm max-w-md mx-auto">
            Gunakan Akun Google Anda untuk login secara aman. Riwayat pesanan Anda akan tersimpan rapi untuk kemudahan pelacakan di masa depan.
          </p>
          <button
            onClick={onLogin}
            className="bg-[#154212] hover:bg-[#2d5a27] text-white px-8 py-3.5 rounded-xl font-bold transition-all active:scale-95 inline-flex items-center gap-2 shadow-md"
          >
            Masuk dengan Google
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Panel: Simple Order Summary Card */}
          <div className="lg:col-span-5 bg-zinc-50 rounded-2xl border border-zinc-200 p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-[#154212] font-display border-b border-zinc-200 pb-3">
              Ringkasan Pesanan
            </h2>

            {/* Product Card Row */}
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-white flex-shrink-0 flex items-center justify-center">
                {orderItem.product.images && orderItem.product.images[0] ? (
                  <img
                    src={orderItem.product.images[0]}
                    alt={orderItem.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-zinc-400">No Img</span>
                )}
              </div>
              <div className="flex-grow space-y-1">
                <h3 className="font-bold text-zinc-900 text-base">{orderItem.product.name}</h3>
                <p className="text-xs text-zinc-500 font-semibold uppercase">
                  Rp {orderItem.product.price.toLocaleString('id-ID')} / unit
                </p>
                <div className="text-sm text-zinc-700 font-medium">
                  Kuantitas: <span className="font-bold text-zinc-900">{orderItem.quantity} pcs</span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-zinc-200 pt-4 space-y-3">
              <div className="flex justify-between text-zinc-600 text-sm font-medium">
                <span>Subtotal Produk:</span>
                <span className="text-zinc-900 font-bold">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              
              {estimasiOngkir !== null && (
                <div className="flex justify-between text-zinc-600 text-sm font-medium">
                  <span>Estimasi Ongkir:</span>
                  <span className="text-zinc-900 font-bold">
                    Rp {estimasiOngkir.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div className="border-t border-zinc-200 pt-4 flex justify-between items-end">
                <div>
                  <span className="text-zinc-900 font-bold text-base">Total Estimasi:</span>
                  <p className="text-[10px] text-amber-700 font-bold mt-0.5 leading-tight">
                    *Harga final dikonfirmasi Admin via WhatsApp
                  </p>
                </div>
                <span className="text-xl font-extrabold text-[#154212] whitespace-nowrap">
                  Rp {(subtotal + (estimasiOngkir || 0)).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Short Checkout Shipping Address & Autocomplete Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#154212] font-display border-b border-zinc-200 pb-3 mb-6">
              Data Pengiriman &amp; Lokasi
            </h2>

            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              {hasEmptyProfileAddress && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Alamat Pengiriman Belum Diatur</h4>
                    <p className="text-[11px] text-amber-800 mt-1 leading-normal font-medium">
                      Anda belum menyimpan alamat pengiriman utama di profil Anda. Silakan lengkapi form pengiriman di bawah (termasuk Alamat Lengkap dan Kecamatan). Alamat ini akan otomatis disimpan ke Profil Anda untuk mempermudah pesanan berikutnya.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Nama Lengkap Penerima
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama penerima..."
                      className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#154212] focus:border-[#154212] transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                    No. WhatsApp Penerima
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#154212] focus:border-[#154212] transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Autocomplete Destination Area */}
              <div className="space-y-2 relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Cari Kecamatan / Kota Tujuan (RajaOngkir Autocomplete)
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Ketik minimal 3 huruf, misal: Getasan atau Semarang"
                    value={selectedDest ? (selectedDest.label || `${selectedDest.subdistrict_name}, ${selectedDest.city_name}`) : destSearch}
                    onChange={(e) => {
                      setDestSearch(e.target.value);
                      if (selectedDest) {
                        setSelectedDest(null);
                        setShippingRates([]);
                        setSelectedRate(null);
                      }
                      setShowDestDropdown(true);
                    }}
                    onFocus={() => setShowDestDropdown(true)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#154212] focus:border-[#154212] transition-all text-sm font-medium"
                  />
                  {searchingDest && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-semibold animate-pulse">
                      Mencari...
                    </div>
                  )}
                </div>

                {/* Autocomplete Dropdown list */}
                {showDestDropdown && destResults.length > 0 && !selectedDest && (
                  <div className="absolute z-10 w-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-zinc-100">
                    {destResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedDest(result);
                          setDestSearch('');
                          setShowDestDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors block"
                      >
                        {result.label || `${result.subdistrict_name}, ${result.city_name}, ${result.province}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Alamat Lengkap Penerima (Dusun, Jalan, RT/RW, No. Rumah)
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan rincian alamat detail..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#154212] focus:border-[#154212] transition-all text-sm"
                />
              </div>

              {/* Shipping Rate Estimations - INFORMASI SAJA */}
              {selectedDest && (
                <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-zinc-700">
                    <Truck className="w-5 h-5 text-[#154212]" />
                    <span className="text-sm font-bold text-[#154212]">Estimasi Biaya Pengiriman</span>
                  </div>

                  {loadingRates ? (
                    <div className="text-xs text-zinc-500 font-bold py-2 animate-pulse flex items-center gap-1.5">
                      <div className="w-4 h-4 border-2 border-[#154212] border-t-transparent rounded-full animate-spin"></div>
                      Sedang memuat tarif pengiriman...
                    </div>
                  ) : (
                    <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-semibold text-zinc-600">Estimasi Ongkir:</span>
                          {!cheapestRate && (
                            <span className="block text-[10px] text-amber-600 font-bold">(Estimasi Sistem)</span>
                          )}
                        </div>
                        <span className="text-lg font-extrabold text-[#154212]">
                          Rp {estimasiOngkir.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-700 font-bold mt-2 leading-normal">
                        *Ini hanya estimasi. Harga final (termasuk biaya packing, bubble wrap, atau penyesuaian berat) akan dikonfirmasi Admin via WhatsApp
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || loadingRates || !fullName.trim() || !phone.trim() || !address.trim() || !selectedDest}
                className="w-full bg-[#154212] hover:bg-[#2d5a27] text-white py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Kirim Rincian Pesanan ke WhatsApp Admin</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </ScrollReveal>
  );
};
export default CartAndCheckoutView;
