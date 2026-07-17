export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoUrl: string;
  phone: string;
  address: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  weight?: number; // in grams
  images: string[];
  isActive: boolean;
  benefits?: string[];
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'menunggu_konfirmasi' | 'diproses' | 'dikirim' | 'selesai';

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: string;
  phone: string;
  courier: string;
  courierService?: string;
  shippingCost?: number;
  shippingEstimate?: number | null;
  destinationAreaId?: string;
  trackingNumber: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  status: 'pending' | 'settlement' | 'expire' | 'failure';
  midtransResponse?: any;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  coverImage: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  tags: string[];
}

export interface HeroMediaItem {
  type: 'image' | 'video';
  url: string;
  order: number;
}

export interface HomepageSection {
  id: string;
  type: 'hero' | 'banner' | 'about' | 'products' | 'articles' | 'partners' | 'faq';
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  order: number;
  heroMedia?: HeroMediaItem[];
  aboutImagesLeft?: string[];
  aboutImagesRight?: string[];
}

export interface SiteSettings {
  logoUrl: string;
  siteName: string;
  tagline: string;
  email: string;
  phone: string;
  contactWhatsApp?: string;
  address: string;
  originAreaId?: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
}

export interface InAppNotification {
  id: string;
  recipientRole: 'admin' | 'user';
  recipientUserId: string | null;
  message: string;
  orderId: string;
  isRead: boolean;
  createdAt: string;
}

export interface SessionLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  loginAt: string;
  userAgent: string;
}

