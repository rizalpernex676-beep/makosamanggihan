import React from 'react';
import { Package, Truck, Receipt, CheckCircle, CreditCard, Copy, Check, Clock, ShieldCheck, HelpCircle, MapPin, Phone, User, LogOut, Trash2 } from 'lucide-react';
import { Order, OrderStatus, UserProfile } from '../types';
import { ScrollReveal } from './ScrollReveal';

interface OrderAndProfileViewProps {
  orders: Order[];
  currentUser: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => Promise<void>;
  onDeleteOrder?: (orderId: string) => Promise<void>;
}

export const OrderAndProfileView: React.FC<OrderAndProfileViewProps> = ({
  orders,
  currentUser,
  onSaveProfile,
  onLogout,
  onNavigate,
  selectedOrder,
  onSelectOrder,
  onUpdateStatus,
  onDeleteOrder
}) => {
  const [copied, setCopied] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Profile Form States
  const [profileName, setProfileName] = React.useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = React.useState(currentUser?.phone || '');
  const [profileAddress, setProfileAddress] = React.useState(currentUser?.address || '');

  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfilePhone(currentUser.phone);
      setProfileAddress(currentUser.address);
    }
  }, [currentUser]);

  const handleCopyResi = (num: string) => {
    navigator.clipboard.writeText(num).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSaveProfile({
        ...currentUser,
        name: profileName,
        phone: profilePhone,
        address: profileAddress
      });
      alert("Profil berhasil diperbarui!");
    }, 1500);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'menunggu_konfirmasi':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider">Menunggu Konfirmasi</span>;
      case 'diproses':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">Diproses</span>;
      case 'dikirim':
        return <span className="px-3 py-1 bg-[#154212]/10 text-[#154212] text-xs font-bold rounded-full uppercase tracking-wider">Dikirim</span>;
      case 'selesai':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">Selesai</span>;
    }
  };

  const getStepProgressWidth = (status: OrderStatus) => {
    switch (status) {
      case 'menunggu_konfirmasi': return '10%';
      case 'diproses': return '35%';
      case 'dikirim': return '68%';
      case 'selesai': return '100%';
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center space-y-6 font-sans">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
          <User className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold font-display text-zinc-900">Akses Terbuka Setelah Masuk</h2>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto">Silakan log in dengan akun Google Anda untuk mengakses riwayat transaksi dan mengubah profil Anda.</p>
        <button onClick={() => onNavigate('home')} className="px-6 py-2.5 bg-[#154212] text-white rounded-lg font-semibold text-sm">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // --- RENDERING DETAIL PESANAN ---
  if (selectedOrder) {
    const handlePrintInvoice = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Gagal membuka jendela cetak. Pastikan pop-up tidak diblokir.");
        return;
      }
  
      const itemsRows = selectedOrder.items.map(i => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${i.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${i.qty || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">Rp ${(i.price).toLocaleString('id-ID')}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">Rp ${(i.price * (i.qty || 1)).toLocaleString('id-ID')}</td>
        </tr>
      `).join('');
  
      const subtotal = selectedOrder.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
      const shipping = selectedOrder.shippingEstimate || selectedOrder.shippingCost || 0;
      const total = selectedOrder.totalPrice || (subtotal + shipping);
  
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${selectedOrder.id} - Makosa</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #154212; padding-bottom: 20px; margin-bottom: 30px; }
              .logo-placeholder { font-size: 28px; font-weight: bold; color: #154212; margin: 0; }
              .invoice-title { font-size: 36px; color: #666; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
              .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .info-block { width: 45%; }
              .info-block h3 { font-size: 14px; text-transform: uppercase; color: #888; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
              th { padding: 12px; border-bottom: 2px solid #ddd; background-color: #f9f9f9; text-align: left; font-size: 14px; text-transform: uppercase; color: #555; }
              .totals { width: 50%; float: right; }
              .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .total-row.grand-total { font-size: 20px; font-weight: bold; color: #154212; border-bottom: none; border-top: 2px solid #333; padding-top: 12px; margin-top: 5px; }
              .footer { clear: both; text-align: center; margin-top: 80px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="logo-placeholder">MAKOSA</h1>
                <p style="margin: 5px 0; color: #666;">Produk Kompos Blok Ramah Lingkungan</p>
              </div>
              <div style="text-align: right;">
                <h2 class="invoice-title">Invoice</h2>
                <p style="margin: 5px 0; font-weight: bold;">#${selectedOrder.id}</p>
                <p style="margin: 5px 0; color: #666;">Tanggal: ${new Date(selectedOrder.createdAt).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-block">
                <h3>Ditagihkan Kepada</h3>
                <p style="margin: 0; font-weight: bold; font-size: 16px;">${selectedOrder.userName}</p>
                <p style="margin: 5px 0;">${selectedOrder.userPhone || '-'}</p>
              </div>
              <div class="info-block">
                <h3>Dikirim Ke</h3>
                <p style="margin: 0; font-weight: bold; font-size: 16px;">${selectedOrder.userName}</p>
                <p style="margin: 5px 0; line-height: 1.5;">${selectedOrder.shippingAddress || (selectedOrder.city + ', ' + selectedOrder.province)}</p>
              </div>
            </div>
  
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Harga</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
  
            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div class="total-row">
                <span>Ongkos Kirim (${selectedOrder.shippingMethod || 'Reguler'}):</span>
                <span>Rp ${shipping.toLocaleString('id-ID')}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total Tagihan:</span>
                <span>Rp ${total.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Terima kasih telah berbelanja di Makosa. Simpan invoice ini sebagai bukti pembayaran yang sah.</p>
            </div>
            
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    const totalQty = selectedOrder.items.reduce((sum, item) => sum + item.qty, 0);
    const subtotalCost = selectedOrder.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const orderShippingFee = selectedOrder.shippingEstimate || 0;

    return (
      <ScrollReveal>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 animate-in fade-in duration-300 font-sans">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <button 
              onClick={() => onSelectOrder(null)}
              className="text-xs font-bold text-zinc-500 hover:text-[#154212] flex items-center gap-1.5 mb-3"
            >
              ← Kembali ke Riwayat Pesanan
            </button>
            <h1 className="text-3xl font-bold text-[#154212] font-display">Detail Pesanan</h1>
            <p className="text-sm text-zinc-500">ID: <span className="font-bold text-zinc-900">#{selectedOrder.id}</span> • {new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handlePrintInvoice} className="px-4 py-2 border-2 border-zinc-200 text-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-50 flex items-center gap-2 cursor-pointer transition-colors">
              <Copy className="w-4 h-4" />
              Cetak Invoice
            </button>
            <button onClick={() => onNavigate('pusat-faq')} className="px-4 py-2 bg-[#154212] text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer hover:bg-[#0c2a0a] transition-colors">
              <HelpCircle className="w-4 h-4" />
              Bantuan
            </button>
          </div>
        </div>

        {/* 4-Stage Status Stepper Progress Bar */}
        <div className="bg-white rounded-xl p-8 mb-8 border border-zinc-200/50 shadow-sm">
          <div className="relative w-full max-w-4xl mx-auto pt-4 pb-8">
            {/* Base line */}
            <div className="absolute top-9 left-0 w-full h-[2px] bg-zinc-200 -z-10"></div>
            {/* Active line */}
            <div 
              className="absolute top-9 left-0 h-[2px] bg-[#154212] -z-10 transition-all duration-500"
              style={{ width: getStepProgressWidth(selectedOrder.status) }}
            ></div>

            {/* Stepper nodes */}
            <div className="relative z-10 flex justify-between">
              {/* Step 1: Menunggu */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#154212] text-white flex items-center justify-center shadow-md border-4 border-white">
                  <Check className="w-5 h-5" />
                </div>
                <p className="mt-3 font-semibold text-xs text-[#154212] text-center leading-tight">Menunggu<br/>Konfirmasi</p>
              </div>

              {/* Step 2: Diproses */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-white ${
                  ['diproses', 'dikirim', 'selesai'].includes(selectedOrder.status)
                    ? 'bg-[#154212] text-white'
                    : 'bg-zinc-200 text-zinc-400'
                }`}>
                  {['dikirim', 'selesai'].includes(selectedOrder.status) ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <p className={`mt-3 font-semibold text-xs text-center leading-tight ${
                  ['diproses', 'dikirim', 'selesai'].includes(selectedOrder.status) ? 'text-[#154212]' : 'text-zinc-400'
                }`}>Diproses</p>
              </div>

              {/* Step 3: Dikirim */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-white ${
                  ['dikirim', 'selesai'].includes(selectedOrder.status)
                    ? 'bg-[#154212] text-white'
                    : 'bg-zinc-200 text-zinc-400'
                }`}>
                  {selectedOrder.status === 'selesai' ? <Check className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                </div>
                <p className={`mt-3 font-semibold text-xs text-center leading-tight ${
                  ['dikirim', 'selesai'].includes(selectedOrder.status) ? 'text-[#154212]' : 'text-zinc-400'
                }`}>Dikirim</p>
              </div>

              {/* Step 4: Selesai */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-white ${
                  selectedOrder.status === 'selesai'
                    ? 'bg-[#154212] text-white'
                    : 'bg-zinc-200 text-zinc-400'
                }`}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className={`mt-3 font-semibold text-xs text-center leading-tight ${
                  selectedOrder.status === 'selesai' ? 'text-[#154212] font-bold' : 'text-zinc-400'
                }`}>Selesai</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info detail columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Courier */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-xl p-8 border border-zinc-200/50 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-[#154212]" />
                <h2 className="text-xl font-bold text-zinc-900 font-display">Informasi Pengiriman</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Penerima</p>
                  <p className="text-lg font-bold text-zinc-900">{selectedOrder.userName}</p>
                  <p className="text-sm text-zinc-500">{selectedOrder.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Alamat Lengkap</p>
                  <p className="text-sm text-zinc-700 leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
              </div>
            </section>

            {/* Courier Section */}
            {selectedOrder.courier && (
              <section className="bg-[#154212]/5 border-2 border-[#154212]/20 rounded-xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-[#154212]/10 select-none">
                  <Truck className="w-36 h-36" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5.5 h-5.5 text-[#154212]" />
                    <h2 className="text-lg font-bold text-[#154212] font-display">Detail Kurir &amp; Resi</h2>
                  </div>
                  <div className="flex flex-wrap gap-8 items-center">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ekspedisi</p>
                      <p className="font-bold text-zinc-900 text-lg">{selectedOrder.courier}</p>
                    </div>
                    {selectedOrder.trackingNumber ? (
                      <div className="bg-white px-4 py-2 rounded-lg border border-[#154212]/20">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nomor Resi</p>
                        <div className="flex items-center gap-3">
                          <p className="font-mono font-bold tracking-widest text-[#154212] text-lg">{selectedOrder.trackingNumber}</p>
                          <button 
                            onClick={() => handleCopyResi(selectedOrder.trackingNumber)}
                            className="text-[#154212] hover:bg-[#154212]/10 p-1.5 rounded transition-all"
                            title="Copy tracking number"
                          >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">Resi pengiriman belum diinput oleh Admin.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Products purchased list */}
            <section className="bg-white rounded-xl border border-zinc-200/50 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#154212]" />
                <h2 className="text-lg font-bold text-zinc-900 font-display">Daftar Produk ({totalQty})</h2>
              </div>
              <div className="divide-y divide-zinc-100">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-6 flex items-center gap-4 hover:bg-zinc-50/50 transition-colors">
                    {item.image ? (
                      <img src={item.image || undefined} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" alt={item.name} />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 flex-shrink-0">No Img</div>
                    )}
                    <div className="flex-grow">
                      <p className="font-bold text-zinc-900 text-sm sm:text-base">{item.name}</p>
                      <p className="text-xs text-zinc-500">{item.qty} unit x Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <span className="font-bold text-zinc-950">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column invoice total */}
          <div>
            <aside className="bg-white rounded-xl border border-zinc-200/50 shadow-lg p-6 sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-[#154212] font-display border-b border-zinc-100 pb-3">
                Ringkasan Pembayaran
              </h2>
              <div className="space-y-4 text-sm text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-zinc-950">Rp {subtotalCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span className="font-semibold text-zinc-950">
                    {orderShippingFee > 0 ? `Rp ${orderShippingFee.toLocaleString('id-ID')}` : 'Gratis / Belum Diisi'}
                  </span>
                </div>
                <div className="h-[1px] bg-zinc-100 pt-2"></div>
                <div className="flex justify-between text-base font-bold text-[#154212] pt-1">
                  <span>Total Tagihan</span>
                  <span className="text-xl font-extrabold">Rp {(subtotalCost + orderShippingFee).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-zinc-50 p-4 rounded-lg flex items-center gap-3 border border-zinc-150">
                  <CreditCard className="w-5 h-5 text-[#154212]" />
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Metode Pembayaran</p>
                    <p className="text-sm font-bold text-zinc-900">WhatsApp / Transfer Manual</p>
                  </div>
                </div>
              </div>

              {/* Customer Actions */}
              {(selectedOrder.status === 'dikirim' || selectedOrder.status === 'selesai') && (
                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  {selectedOrder.status === 'dikirim' && onUpdateStatus && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm("Apakah Anda yakin telah menerima pesanan ini dengan baik? Tindakan ini tidak dapat dibatalkan.")) {
                          try {
                            await onUpdateStatus(selectedOrder.id, 'selesai');
                            onSelectOrder(null);
                          } catch (err: any) {
                            alert(`Gagal memperbarui: ${err.message || err}`);
                          }
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#154212] hover:bg-[#2d5a27] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Konfirmasi Pesanan Selesai</span>
                    </button>
                  )}

                  {selectedOrder.status === 'selesai' && onDeleteOrder && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm("Apakah Anda yakin ingin menghapus history pesanan ini dari akun Anda?")) {
                          try {
                            await onDeleteOrder(selectedOrder.id);
                            onSelectOrder(null);
                          } catch (err: any) {
                            alert(`Gagal menghapus: ${err.message || err}`);
                          }
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Riwayat Pesanan</span>
                    </button>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
      </ScrollReveal>
    );
  }

  // --- RENDERING ORDER HISTORY & EDIT PROFILE ---
  return (
    <ScrollReveal>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-300 font-sans">
      {/* Left Column: Orders History List */}
      <div className="lg:col-span-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[#154212] font-display">Riwayat Pesanan Saya</h2>
          <p className="text-sm text-zinc-500 mt-1">Pantau status pesanan produk ramah lingkungan Anda dari Desa MAKOSA di sini.</p>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-xl">
            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="font-bold text-zinc-700 text-lg">Belum Ada Transaksi</h3>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto mt-1">Ayo jelajahi katalog kami dan pesan Kompos Blok untuk menyuburkan kebun Anda.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const qtySum = order.items.reduce((sum, item) => sum + item.qty, 0);
              return (
                <div 
                  key={order.id}
                  className="bg-white border border-zinc-200/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ORDER ID</p>
                        <p className="font-bold text-[#154212]">#{order.id}</p>
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">TANGGAL</p>
                          <p className="text-xs font-semibold text-zinc-800">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">TOTAL TAGIHAN</p>
                          <p className="text-xs font-extrabold text-zinc-900">Rp {order.totalPrice.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {order.items && order.items[0] && order.items[0].image ? (
                          <img src={order.items[0].image || undefined} className="w-12 h-12 object-cover rounded" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400">No Img</div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-zinc-900 truncate max-w-xs">{order.items[0].name}</p>
                          {order.items.length > 1 && (
                            <p className="text-xs text-zinc-500">+{order.items.length - 1} produk lainnya ({qtySum} total unit)</p>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => onSelectOrder(order)}
                        className="px-6 py-2 bg-[#154212]/10 hover:bg-[#154212]/20 text-[#154212] font-bold text-xs rounded-lg transition-all"
                      >
                        Lacak &amp; Detail →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: User Profile Editor Panel */}
      <div className="lg:col-span-4 bg-white p-8 rounded-xl border border-zinc-200/50 shadow-sm relative overflow-hidden">
        {/* Decorative soft glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#154212]/5 rounded-full blur-2xl"></div>

        <div className="relative space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#154212]/20 flex items-center justify-center bg-[#154212] text-white font-bold text-xl">
              {currentUser.photoUrl ? (
                <img src={currentUser.photoUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <span>{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 font-display">{currentUser.name}</h3>
              <p className="text-xs text-zinc-500">{currentUser.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider" htmlFor="pname">Nama Lengkap</label>
              <input 
                id="pname"
                type="text" 
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 bg-white text-zinc-900 rounded-lg focus:border-[#154212] focus:ring-1 focus:ring-[#154212]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider" htmlFor="pphone">Nomor WhatsApp</label>
              <input 
                id="pphone"
                type="tel" 
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="Contoh: +62 812-3456-7890"
                className="w-full px-3 py-2 text-sm border border-zinc-300 bg-white text-zinc-900 rounded-lg focus:border-[#154212] focus:ring-1 focus:ring-[#154212]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider" htmlFor="paddress">Alamat Pengiriman Utama</label>
              <textarea 
                id="paddress"
                required
                rows={3}
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                placeholder="Jl. Raya Desa No. 12, Jawa Tengah (wajib diisi)"
                className="w-full px-3 py-2 text-sm border border-zinc-300 bg-white text-zinc-900 rounded-lg focus:border-[#154212] focus:ring-1 focus:ring-[#154212] resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-[#154212] hover:bg-[#2d5a27] text-white py-3 rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>

          <div className="h-[1px] bg-zinc-150"></div>

          <div className="space-y-3 bg-[#154212]/5 p-4 rounded-xl text-xs text-zinc-600">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#154212] flex-shrink-0" />
              <span>Sistem Enkripsi Data Pribadi Tersertifikasi.</span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 font-semibold py-3 rounded-lg text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun (Log Out)</span>
          </button>
        </div>
      </div>
    </div>
    </ScrollReveal>
  );
};
export default OrderAndProfileView;
