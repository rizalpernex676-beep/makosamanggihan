import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomepageView } from './components/HomepageView';
import { ProductDetailView } from './components/ProductDetailView';
import { CartAndCheckoutView } from './components/CartAndCheckoutView';
import { OrderAndProfileView } from './components/OrderAndProfileView';
import { AdminViews } from './components/AdminViews';
import { KatalogProdukPage, ArtikelTerbaruPage, PusatFAQPage, KebijakanPrivasiPage, SyaratKetentuanPage } from './components/InfoPages';
import { dbService, authService, auth } from './lib/db';
import { Product, Article, FAQ, HomepageSection, SiteSettings, Order, CartItem, UserProfile, OrderStatus, InAppNotification } from './types';

export default function App() {
  // Global View Router
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Loaded database collections
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [adminSelectedOrderId, setAdminSelectedOrderId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  // Cart operations
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('makosa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('makosa_cart', JSON.stringify(cart));
  }, [cart]);

  // Selection models
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 1. Initial Load Hook
  useEffect(() => {
    async function loadAllData() {
      try {
        const [prodList, artList, faqList, secList, generalSettings, orderList] = await Promise.all([
          dbService.getProducts(),
          dbService.getArticles(),
          dbService.getFAQs(),
          dbService.getHomepageSections(),
          dbService.getSettings(),
          dbService.getOrders()
        ]);

        setProducts(prodList || []);
        setArticles(artList || []);
        setFaqs(faqList || []);
        setSections(secList || []);
        setSettings(generalSettings);
        setOrders(orderList || []);

        // Authenticated user
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) {
          setCurrentUser(cachedUser);
        }
      } catch (err) {
        console.error("Failed to load initial db data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  // 1b. Listen to Firebase Auth state changes to refresh user session & collections
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      try {
        if (firebaseUser) {
          let adminClaim = false;
          try {
            // Force refresh token to get the absolute latest claims
            const idTokenResult = await firebaseUser.getIdTokenResult(true);
            adminClaim = idTokenResult?.claims?.admin === true || firebaseUser.email === 'farizhakimz7@gmail.com';
          } catch (tokErr) {
            console.error("Failed to fetch fresh ID token result:", tokErr);
            adminClaim = firebaseUser.email === 'farizhakimz7@gmail.com';
          }

          setIsAdmin(adminClaim);

          // Get the fresh user profile
          let freshProfile = await authService.getProfile(firebaseUser.uid);
          if (!freshProfile) {
            const cachedUser = authService.getCurrentUser();
            if (cachedUser && cachedUser.uid === firebaseUser.uid) {
              freshProfile = cachedUser;
            } else {
              // Create profile if none exists
              freshProfile = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Pengguna Baru',
                email: firebaseUser.email || '',
                photoUrl: firebaseUser.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuJ5vxoE888QbH64AQzcZiMbkiwvCl9U2tIQyx0rN5HCTEIWQap0XeWun0cvvzYziIgzaQ1RGLvZxy_Ou3aj--luquUN5-O36XH0L-sPARE82295cXDRLe4TLRQwjfxdU4-EN1p-Wk6LXHesX8VjKSEgASNEHfW1tQuIvTKRFJMcIfHskPn2adTX5gGDvxEmthhg3-f90BP6Syf6PnTnY3vJuaFUQcx3EwUl1wRxSyyXC67x46pYx',
                phone: '',
                address: '',
                role: adminClaim ? 'admin' : 'user',
                createdAt: new Date().toISOString()
              };
              await authService.saveProfile(freshProfile);
            }
          }

          // Sync the local profile role with current claim
          const updatedProfile = {
            ...freshProfile,
            role: (adminClaim ? 'admin' : 'user') as 'admin' | 'user'
          };
          
          setCurrentUser(updatedProfile);
          localStorage.setItem('makosa_current_user', JSON.stringify(updatedProfile));

          // Reload collections now that we are authenticated (different role permissions)
          const [prodList, artList, orderList] = await Promise.all([
            dbService.getProducts(),
            dbService.getArticles(),
            dbService.getOrders()
          ]);
          setProducts(prodList || []);
          setArticles(artList || []);
          setOrders(orderList || []);
        } else {
          // User is logged out, clear order list and load guest-accessible products and articles
          setCurrentUser(null);
          setIsAdmin(false);
          setOrders([]);
          const [prodList, artList] = await Promise.all([
            dbService.getProducts(),
            dbService.getArticles()
          ]);
          setProducts(prodList || []);
          setArticles(artList || []);
        }
      } catch (err) {
        console.error("Error synchronizing auth state change:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // 1d. Real-time Products & Stock Subscription
  useEffect(() => {
    const unsubscribe = dbService.subscribeProducts(isAdmin, (freshProducts) => {
      setProducts(freshProducts);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  // 1c. Real-time Notifications Subscription
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const unsubscribe = dbService.subscribeNotifications(currentUser.role, currentUser.uid, (freshNotifs) => {
      setNotifications(freshNotifs);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 2. Real-time Orders Subscription
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      setUserOrders([]);
      return;
    }

    if (currentUser.role === 'admin') {
      const unsubscribe = dbService.subscribeOrders('admin', currentUser.uid, (freshOrders) => {
        setOrders(freshOrders);
        setUserOrders(freshOrders);
      });
      return () => unsubscribe();
    } else {
      const unsubscribe = dbService.subscribeOrders('user', currentUser.uid, (freshOrders) => {
        setUserOrders(freshOrders);
        setOrders(freshOrders);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // 3. User Authentication Controls
  const handleGoogleLogin = async () => {
    try {
      const profile = await authService.loginWithGoogle();
      setCurrentUser(profile);
    } catch (err) {
      console.error("Login trigger failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setCurrentView('home');
    } catch (err) {
      console.error("Logout trigger failed:", err);
    }
  };

  const handleSaveProfile = (updated: UserProfile) => {
    authService.saveProfile(updated);
    setCurrentUser(updated);
  };

  // 4. WhatsApp Order Flow & Handlers
  const handleOrderNow = async (product: Product, quantity: number = 1) => {
    // Store pending order details in localStorage for post-login recovery
    localStorage.setItem('makosa_pending_order', JSON.stringify({ productId: product.id, quantity }));

    if (!currentUser) {
      alert("Silakan masuk dengan akun Google Anda terlebih dahulu untuk memproses pesanan.");
      try {
        await handleGoogleLogin();
      } catch (err) {
        console.error("Login failed:", err);
      }
      return;
    }

    setCart([{ product, quantity }]);
    setCurrentView('cart');
  };

  // Pending order auto-recovery hook after successful Google login
  useEffect(() => {
    if (currentUser && products.length > 0) {
      const pendingStr = localStorage.getItem('makosa_pending_order');
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          localStorage.removeItem('makosa_pending_order');
          const foundProduct = products.find(p => p.id === pending.productId);
          if (foundProduct) {
            setCart([{ product: foundProduct, quantity: pending.quantity }]);
            setCurrentView('cart');
          }
        } catch (e) {
          console.error("Error processing pending order:", e);
        }
      }
    }
  }, [currentUser, products]);

  // 5. Place and Process Order via WhatsApp
  const handleCheckoutComplete = async (
    shippingAddress: string,
    phone: string,
    fullName: string,
    shippingEstimate: number | null,
    courier: string,
    courierService: string,
    destinationAreaId: string
  ) => {
    if (!currentUser || cart.length === 0) return;

    try {
      // Sync checkout recipient details back to User Profile in Firestore if empty or changed
      const rawAddress = shippingAddress.split(', Kecamatan/Kota:')[0];
      if (!currentUser.address || currentUser.address !== rawAddress || !currentUser.phone || currentUser.phone !== phone || currentUser.name !== fullName) {
        const updatedProfile = {
          ...currentUser,
          name: fullName,
          phone: phone,
          address: rawAddress
        };
        await authService.saveProfile(updatedProfile);
        setCurrentUser(updatedProfile);
      }

      const orderItem = cart[0];
      const itemsSubtotal = orderItem.product.price * orderItem.quantity;

      // Fetch latest products to validate real-time stock
      const freshProds = await dbService.getProducts();
      const dbProduct = freshProds.find(p => p.id === orderItem.product.id);
      const currentStock = dbProduct ? dbProduct.stock : orderItem.product.stock;

      if (currentStock < orderItem.quantity) {
        alert(`Maaf, stok produk "${orderItem.product.name}" tidak mencukupi (Tersedia: ${currentStock}).`);
        return;
      }

      // Generate unique order ID
      const orderId = 'MKS-' + Math.floor(100000 + Math.random() * 900000);

      // Create domain transaction model
      const newOrder: Order = {
        id: orderId,
        userId: currentUser.uid,
        userName: fullName,
        phone,
        shippingAddress,
        items: [
          {
            productId: orderItem.product.id,
            name: orderItem.product.name,
            qty: orderItem.quantity,
            price: orderItem.product.price,
            image: orderItem.product.images[0] || ''
          }
        ],
        totalPrice: itemsSubtotal, // Subtotal produk saja, tanpa ongkir final
        shippingEstimate, // Angka estimasi ongkir yang dipilih, boleh null jika user skip
        status: 'menunggu_konfirmasi', // Status awal 'menunggu_konfirmasi'
        courier,
        courierService,
        destinationAreaId,
        trackingNumber: '',
        paymentId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Record order in Firestore (client-side allowed by security rules)
      await dbService.saveOrder(newOrder);

      // Create notification for Admin (fixes in-app notification requirement)
      try {
        await dbService.createNotification({
          recipientRole: 'admin',
          recipientUserId: null,
          message: `Pesanan baru #${orderId} dari ${fullName}`,
          orderId: orderId,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } catch (notifErr) {
        console.error("Gagal membuat notifikasi admin:", notifErr);
      }

      // Clear selection
      setCart([]);

      // Dynamic redirect to WhatsApp Admin (fixes Bug 1)
      const adminWhatsApp = settings?.contactWhatsApp || '6282322418043';
      let cleanWhatsApp = adminWhatsApp.replace(/[^0-9]/g, '');
      if (cleanWhatsApp.startsWith('0')) {
        cleanWhatsApp = '62' + cleanWhatsApp.substring(1);
      } else if (cleanWhatsApp.startsWith('8')) {
        cleanWhatsApp = '62' + cleanWhatsApp;
      }

      const productSubtotalFormatted = itemsSubtotal.toLocaleString('id-ID');
      const shippingFormatted = shippingEstimate !== null ? `Rp ${shippingEstimate.toLocaleString('id-ID')}` : 'Tidak dipilih';
      const courierText = shippingEstimate !== null ? `${courier} - ${courierService}` : 'Belum ditentukan';

      const message = `Halo Admin MAKOSA, saya ingin memesan:\n- ${orderItem.product.name} x${orderItem.quantity} = Rp ${productSubtotalFormatted}\n\nEstimasi ongkir (${courierText}): ${shippingFormatted}\n\nNama: ${fullName}\nAlamat: ${shippingAddress}\nNo. Order: ${orderId}\n\nMohon konfirmasi ketersediaan & total akhir. Terima kasih!`;
      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/${cleanWhatsApp}?text=${encodedMsg}`;

      alert("Pesanan berhasil dicatat! Mengalihkan Anda ke WhatsApp Admin...");
      window.open(waUrl, '_blank');

      // Refresh products and orders list
      const [freshProducts, freshOrders] = await Promise.all([
        dbService.getProducts(),
        dbService.getOrders()
      ]);
      setProducts(freshProducts);
      setOrders(freshOrders);

      // Auto route customer to track their new order
      setSelectedOrder(newOrder);
      setCurrentView('orders');
    } catch (err: any) {
      console.error("Order processing failure:", err);
      alert(`Gagal memproses transaksi: ${err.message || err}`);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await dbService.updateOrderStatus(orderId, 'selesai');

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: 'selesai',
          updatedAt: new Date().toISOString()
        });
      }
      alert("Terima kasih! Pesanan telah dikonfirmasi selesai.");
    } catch (err: any) {
      console.error("Failed to update status to complete:", err);
      alert(`Gagal mengonfirmasi selesai: ${err.message || err}`);
    }
  };

  const handleMarkNotificationRead = async (id: string, orderId: string) => {
    try {
      await dbService.markNotificationAsRead(id);
      
      // Update local state instantly for positive response feel
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      
      if (currentUser?.role === 'admin') {
        setAdminSelectedOrderId(orderId);
        setCurrentView('admin-dashboard');
      } else {
        const matched = orders.find(o => o.id === orderId);
        if (matched) {
          setSelectedOrder(matched);
        }
        setCurrentView('orders');
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // 6. Admin Panel Hooks
  const handleSaveProductAdmin = async (p: Product) => {
    await dbService.saveProduct(p);
    const list = await dbService.getProducts();
    setProducts(list);
  };

  const handleDeleteProductAdmin = async (id: string) => {
    try {
      await dbService.deleteProduct(id);
      const list = await dbService.getProducts();
      setProducts(list);
    } catch (err: any) {
      console.error("Gagal menghapus produk:", err);
      alert(`Gagal menghapus produk: ${err.message || err}`);
      throw err;
    }
  };

  const handleSaveArticleAdmin = async (a: Article) => {
    await dbService.saveArticle(a);
    const list = await dbService.getArticles();
    setArticles(list);
  };

  const handleDeleteArticleAdmin = async (id: string) => {
    try {
      await dbService.deleteArticle(id);
      const list = await dbService.getArticles();
      setArticles(list);
    } catch (err: any) {
      console.error("Gagal menghapus artikel:", err);
      alert(`Gagal menghapus artikel: ${err.message || err}`);
      throw err;
    }
  };

  const handleSaveFAQAdmin = async (f: FAQ) => {
    await dbService.saveFAQ(f);
    const list = await dbService.getFAQs();
    setFaqs(list);
  };

  const handleDeleteFAQAdmin = async (id: string) => {
    try {
      await dbService.deleteFAQ(id);
      const list = await dbService.getFAQs();
      setFaqs(list);
    } catch (err: any) {
      console.error("Gagal menghapus FAQ:", err);
      alert(`Gagal menghapus FAQ: ${err.message || err}`);
      throw err;
    }
  };

  const handleSaveSettingsAdmin = async (s: SiteSettings) => {
    await dbService.saveSettings(s);
    setSettings(s);
  };

  const handleSaveSectionAdmin = async (sec: HomepageSection) => {
    await dbService.saveHomepageSection(sec);
    const list = await dbService.getHomepageSections();
    setSections(list);
  };

  const handleUpdateOrderStatusAdmin = async (orderId: string, status: OrderStatus, courier?: string, trackingNumber?: string) => {
    try {
      await dbService.updateOrderStatus(orderId, status, courier, trackingNumber);
      alert('Status pesanan berhasil diperbarui!');
    } catch (err: any) {
      console.error("Gagal mengubah status pesanan oleh admin:", err);
      alert(`Gagal: ${err.message || err}`);
    }
  };

  const handleDeleteOrderAdmin = async (id: string) => {
    try {
      await dbService.deleteOrder(id);
      const list = await dbService.getOrders();
      setOrders(list);
    } catch (err: any) {
      console.error("Gagal menghapus riwayat pesanan:", err);
      alert(`Gagal menghapus: ${err.message || err}`);
      throw err;
    }
  };

  const handleUpdateOrderStatusUser = async (orderId: string, status: OrderStatus) => {
    try {
      await dbService.updateOrderStatus(orderId, status);
      const list = await dbService.getOrders();
      setOrders(list || []);
      alert('Pesanan berhasil diselesaikan! Terima kasih.');
    } catch (err: any) {
      console.error("Gagal menyelesaikan pesanan:", err);
      alert(`Gagal: ${err.message || err}`);
    }
  };

  const handleDeleteOrderUser = async (id: string) => {
    try {
      await dbService.deleteOrder(id);
      const list = await dbService.getOrders();
      setOrders(list || []);
      alert('History pesanan berhasil dihapus.');
    } catch (err: any) {
      console.error("Gagal menghapus riwayat pesanan:", err);
      alert(`Gagal menghapus: ${err.message || err}`);
    }
  };

  // 7. Render skeleton loader
  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-10 w-10 text-[#154212]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm font-semibold text-[#154212] tracking-wide uppercase">Memuat Data Portal MAKOSA Desa Manggihan...</p>
      </div>
    );
  }

  // Check if Admin Panel view is requested
  const isAdminView = currentView.startsWith('admin-');

  if (isAdminView && isAdmin) {
    return (
      <>
        <AdminViews
          products={products}
          articles={articles}
          faqs={faqs}
          sections={sections}
          settings={settings}
          orders={orders}
          onSaveProduct={handleSaveProductAdmin}
          onDeleteProduct={handleDeleteProductAdmin}
          onSaveArticle={handleSaveArticleAdmin}
          onDeleteArticle={handleDeleteArticleAdmin}
          onSaveFAQ={handleSaveFAQAdmin}
          onDeleteFAQ={handleDeleteFAQAdmin}
          onSaveSettings={handleSaveSettingsAdmin}
          onSaveSection={handleSaveSectionAdmin}
          onUpdateOrderStatus={handleUpdateOrderStatusAdmin}
          onDeleteOrder={handleDeleteOrderAdmin}
          onLogout={handleLogout}
          preSelectedOrderId={adminSelectedOrderId}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 transition-colors">
      <Navbar 
        currentUser={currentUser}
        isAdmin={isAdmin}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedProduct(null);
          setSelectedOrder(null);
          setAdminSelectedOrderId(undefined);
        }}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        settings={settings}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      <main className="flex-grow">
        {currentView === 'home' && !selectedProduct && (
          <HomepageView 
            products={products}
            articles={articles}
            faqs={faqs}
            sections={sections}
            settings={settings}
            onViewProduct={(p) => setSelectedProduct(p)}
            onOrderNow={(p, qty) => handleOrderNow(p, qty)}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'katalog-produk' && !selectedProduct && (
          <KatalogProdukPage 
            products={products}
            onViewProduct={(p) => setSelectedProduct(p)}
            onOrderNow={(p, qty) => handleOrderNow(p, qty)}
          />
        )}

        {currentView === 'artikel-terbaru' && (
          <ArtikelTerbaruPage 
            articles={articles}
          />
        )}

        {currentView === 'pusat-faq' && (
          <PusatFAQPage 
            faqs={faqs}
            settings={settings}
          />
        )}

        {currentView === 'kebijakan-privasi' && (
          <KebijakanPrivasiPage />
        )}

        {currentView === 'syarat-ketentuan' && (
          <SyaratKetentuanPage />
        )}

        {selectedProduct && (
          <ProductDetailView 
            product={selectedProduct}
            allProducts={products}
            onBack={() => setSelectedProduct(null)}
            onOrderNow={(prod, count) => {
              handleOrderNow(prod, count);
              setSelectedProduct(null);
            }}
            onViewProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {currentView === 'cart' && (
          <CartAndCheckoutView 
            cart={cart}
            currentUser={currentUser}
            settings={settings}
            onLogin={handleGoogleLogin}
            onCheckoutComplete={handleCheckoutComplete}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {(currentView === 'orders' || currentView === 'profile') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16">
            <OrderAndProfileView 
              orders={userOrders}
              currentUser={currentUser}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
              onNavigate={(view) => setCurrentView(view)}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onUpdateStatus={handleUpdateOrderStatusUser}
              onDeleteOrder={handleDeleteOrderUser}
            />
          </div>
        )}
      </main>

      <Footer 
        settings={settings} 
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedProduct(null);
          setSelectedOrder(null);
        }} 
      />
    </div>
  );
}
