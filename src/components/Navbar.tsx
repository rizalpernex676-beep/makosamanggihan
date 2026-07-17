import React from 'react';
import { LogIn, LogOut, Menu, User, ShieldAlert, BookOpen, Compass, Bell } from 'lucide-react';
import { UserProfile, SiteSettings, InAppNotification } from '../types';
// @ts-expect-error - image asset
import makosaLogo from '../assets/images/makosa_logo_final_1784213318719.jpg';

interface NavbarProps {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  settings: SiteSettings;
  notifications: InAppNotification[];
  onMarkNotificationRead: (id: string, orderId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdmin,
  currentView,
  onNavigate,
  onLogin,
  onLogout,
  settings,
  notifications,
  onMarkNotificationRead
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const navLinks: { name: string; view: string; hash?: string }[] = [
    { name: 'Beranda', view: 'home' },
    { name: 'Katalog Produk', view: 'katalog-produk' },
    { name: 'Artikel Terbaru', view: 'artikel-terbaru' },
    { name: 'Pusat FAQ', view: 'pusat-faq' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-200 shadow-sm transition-all duration-300 h-16 md:h-20 overflow-visible">
      <div className="flex justify-between items-center w-full px-6 md:px-10 h-full max-w-7xl mx-auto relative">
        {/* Brand Logo */}
        <div className="relative h-full flex items-center w-48 md:w-60 z-10">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNav('home'); }} 
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1 group animate-fade-in"
          >
            <img 
              alt="MAKOSA Logo" 
              className="h-[100px] md:h-[140px] w-auto max-w-none object-contain transition-transform group-hover:scale-105" 
              src={settings.logoUrl || makosaLogo} 
              referrerPolicy="no-referrer"
            />
            <span className="text-base md:text-lg font-black tracking-wider text-[#154212] font-display uppercase whitespace-nowrap ml-2 md:ml-3">
              MAKOSA
            </span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-sans">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.hash || '#'}
              onClick={(e) => {
                if (!link.hash) {
                  e.preventDefault();
                  handleNav(link.view);
                }
              }}
              className={`font-semibold text-sm transition-all py-1 border-b-2 ${
                currentView === link.view && !link.hash
                  ? 'border-[#154212] text-[#154212]'
                  : 'border-transparent text-zinc-600 hover:text-[#154212]'
              }`}
            >
              {link.name}
            </a>
          ))}

          {currentUser && (
            <>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('orders'); }}
                className={`font-semibold text-sm transition-all py-1 border-b-2 ${
                  currentView === 'orders'
                    ? 'border-[#154212] text-[#154212]'
                    : 'border-transparent text-zinc-600 hover:text-[#154212]'
                }`}
              >
                Pesanan Saya
              </a>
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#154212]/10 hover:bg-[#154212]/20 text-[#154212] rounded-lg text-xs font-bold transition-all"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin Panel
                </button>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 md:gap-5">
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-zinc-600 hover:text-[#154212] hover:bg-zinc-100 rounded-full relative transition-all cursor-pointer focus:outline-none"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-xl z-55 overflow-hidden divide-y divide-zinc-100">
                  <div className="px-4 py-3 bg-[#154212]/5 flex justify-between items-center">
                    <span className="font-bold text-xs text-[#154212] uppercase tracking-wider">Notifikasi</span>
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        {notifications.filter(n => !n.isRead).length} Baru
                      </span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-zinc-400">Tidak ada notifikasi baru.</p>
                    ) : (
                      notifications.map((n) => (
                        <button 
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationRead(n.id, n.orderId);
                            setNotifOpen(false);
                          }}
                          className={`w-full p-4 text-left cursor-pointer transition-colors hover:bg-zinc-50 border-none bg-transparent block ${!n.isRead ? 'bg-zinc-50/80 font-semibold' : ''}`}
                        >
                          <p className="text-xs text-zinc-800 leading-snug">{n.message}</p>
                          <p className="text-[9px] text-zinc-400 mt-1">{new Date(n.createdAt).toLocaleString('id-ID')}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Login menu */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNav('profile')}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#154212]/20 hover:border-[#154212] transition-all cursor-pointer focus:outline-none flex items-center justify-center bg-[#154212] text-white font-bold text-sm"
                title="Edit Profil"
              >
                {currentUser.photoUrl ? (
                  <img 
                    className="w-full h-full object-cover" 
                    src={currentUser.photoUrl} 
                    alt={currentUser.name} 
                  />
                ) : (
                  <span>{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1.5 text-zinc-500 hover:text-red-600 transition-colors text-sm font-semibold"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-[#154212] text-white hover:bg-[#2d5a27] px-5 py-2 rounded-lg text-sm font-semibold transition-transform active:scale-95 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>
          )}

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200 py-4 px-6 flex flex-col gap-3 shadow-inner animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.hash || '#'}
              onClick={(e) => {
                if (!link.hash) {
                  e.preventDefault();
                  handleNav(link.view);
                } else {
                  setMobileMenuOpen(false);
                }
              }}
              className="text-zinc-700 font-semibold text-sm hover:text-[#154212] py-2"
            >
              {link.name}
            </a>
          ))}

          {currentUser && (
            <>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('orders'); }}
                className="text-zinc-700 font-semibold text-sm hover:text-[#154212] py-2"
              >
                Pesanan Saya
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('profile'); }}
                className="text-zinc-700 font-semibold text-sm hover:text-[#154212] py-2"
              >
                Edit Profil
              </a>
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#154212]/10 text-[#154212] font-bold rounded-lg text-sm mt-1"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-zinc-200 text-red-600 font-semibold rounded-lg text-sm mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
