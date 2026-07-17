import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, User as FirebaseUser } from 'firebase/auth';
import { 
  getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, orderBy, getDocFromServer, onSnapshot, runTransaction, writeBatch, limit
} from 'firebase/firestore';
import { Product, Article, FAQ, HomepageSection, SiteSettings, Order, UserProfile, InAppNotification } from '../types';
import { 
  INITIAL_PRODUCTS, INITIAL_ARTICLES, INITIAL_FAQS, INITIAL_SECTIONS, INITIAL_SETTINGS, INITIAL_ORDERS 
} from '../data/mockData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export let firebaseEnabled = false;
export let db: any = null;
export let auth: any = null;


// Graceful Firebase Initialization
try {
  const metaEnv = (import.meta as any).env;
  
  // Use provided config as default, or env if present
  const firebaseConfig = {
    apiKey: metaEnv?.VITE_FIREBASE_API_KEY || "",
    authDomain: metaEnv?.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: metaEnv?.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: metaEnv?.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: metaEnv?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: metaEnv?.VITE_FIREBASE_APP_ID || "",
  };
  
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  firebaseEnabled = true;
  console.log("Firebase initialized successfully.");
} catch (err) {
  console.warn("Firebase initialization failed gracefully. Using LocalStorage fallback:", err);
}

// Error Diagnostic Wrapper
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error diagnostic payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Verify Firebase Connection (from guidelines)
if (firebaseEnabled && db) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Connected to live Cloud Firestore successfully.");
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration or network status.");
      }
    }
  };
  testConnection();
}

// Helper to interact with LocalStorage
const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Unified Database API
export const dbService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (firebaseEnabled && db) {
      try {
        let isAdmin = false;
        if (auth && auth.currentUser) {
          try {
            const idTokenResult = await auth.currentUser.getIdTokenResult();
            isAdmin = !!idTokenResult?.claims?.admin || auth.currentUser.email === 'farizhakimz7@gmail.com';
          } catch (e) {
            console.error("Error checking admin claims:", e);
            isAdmin = auth.currentUser.email === 'farizhakimz7@gmail.com';
          }
        }

        const q = isAdmin 
          ? collection(db, 'products') 
          : query(collection(db, 'products'), where('isActive', '==', true));

        const querySnapshot = await getDocs(q);
        const list: Product[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Product);
        });
        return list;
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'products');
      }
    }
    return getLocal<Product[]>('makosa_products', INITIAL_PRODUCTS);
  },

  subscribeProducts(isAdmin: boolean, callback: (products: Product[]) => void): () => void {
    if (firebaseEnabled && db) {
      try {
        const q = isAdmin 
          ? collection(db, 'products') 
          : query(collection(db, 'products'), where('isActive', '==', true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const list: Product[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Product);
          });
          callback(list);
        }, (err) => {
          console.error("Firestore real-time products subscription error:", err);
        });
        return unsubscribe;
      } catch (err) {
        console.error("Firestore products snapshot subscription failed:", err);
      }
    }
    const interval = setInterval(() => {
      callback(getLocal<Product[]>('makosa_products', INITIAL_PRODUCTS));
    }, 2000);
    return () => clearInterval(interval);
  },

  async saveProduct(product: Product): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        const docRef = doc(db, 'products', product.id);
        await setDoc(docRef, product);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
      }
    }
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    setLocal('makosa_products', products);
  },

  async deleteProduct(id: string): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        await deleteDoc(doc(db, 'products', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      }
    }
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    setLocal('makosa_products', filtered);
  },

  // ARTICLES
  async getArticles(): Promise<Article[]> {
    if (firebaseEnabled && db) {
      try {
        let isAdmin = false;
        if (auth && auth.currentUser) {
          try {
            const idTokenResult = await auth.currentUser.getIdTokenResult();
            isAdmin = !!idTokenResult?.claims?.admin || auth.currentUser.email === 'farizhakimz7@gmail.com';
          } catch (e) {
            console.error("Error checking admin claims:", e);
            isAdmin = auth.currentUser.email === 'farizhakimz7@gmail.com';
          }
        }

        const q = isAdmin 
          ? collection(db, 'articles') 
          : query(collection(db, 'articles'), where('isPublished', '==', true));

        const querySnapshot = await getDocs(q);
        const list: Article[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Article);
        });
        return list;
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'articles');
      }
    }
    return getLocal<Article[]>('makosa_articles', INITIAL_ARTICLES);
  },

  async saveArticle(article: Article): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        const docRef = doc(db, 'articles', article.id);
        await setDoc(docRef, article);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `articles/${article.id}`);
      }
    }
    const articles = await this.getArticles();
    const index = articles.findIndex(a => a.id === article.id);
    if (index > -1) {
      articles[index] = article;
    } else {
      articles.push(article);
    }
    setLocal('makosa_articles', articles);
  },

  async deleteArticle(id: string): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        await deleteDoc(doc(db, 'articles', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `articles/${id}`);
      }
    }
    const articles = await this.getArticles();
    const filtered = articles.filter(a => a.id !== id);
    setLocal('makosa_articles', filtered);
  },

  // FAQS
  async getFAQs(): Promise<FAQ[]> {
    if (firebaseEnabled && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'faqs'));
        const list: FAQ[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as FAQ);
        });
        return list.sort((a, b) => a.order - b.order);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'faqs');
      }
    }
    return getLocal<FAQ[]>('makosa_faqs', INITIAL_FAQS).sort((a, b) => a.order - b.order);
  },

  async saveFAQ(faq: FAQ): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        const docRef = doc(db, 'faqs', faq.id);
        await setDoc(docRef, faq);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `faqs/${faq.id}`);
      }
    }
    const faqs = await this.getFAQs();
    const index = faqs.findIndex(f => f.id === faq.id);
    if (index > -1) {
      faqs[index] = faq;
    } else {
      faqs.push(faq);
    }
    setLocal('makosa_faqs', faqs);
  },

  async deleteFAQ(id: string): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        await deleteDoc(doc(db, 'faqs', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `faqs/${id}`);
      }
    }
    const faqs = await this.getFAQs();
    const filtered = faqs.filter(f => f.id !== id);
    setLocal('makosa_faqs', filtered);
  },

  // SETTINGS
  async getSettings(): Promise<SiteSettings> {
    if (firebaseEnabled && db) {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'general'));
        if (docSnap.exists()) {
          return docSnap.data() as SiteSettings;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'settings/general');
      }
    }
    return getLocal<SiteSettings>('makosa_settings', INITIAL_SETTINGS);
  },

  async saveSettings(settings: SiteSettings): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        await setDoc(doc(db, 'settings', 'general'), settings);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'settings/general');
      }
    }
    setLocal('makosa_settings', settings);
  },

  // HOMEPAGE SECTIONS
  async getHomepageSections(): Promise<HomepageSection[]> {
    if (firebaseEnabled && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'homepageContent'));
        const list: HomepageSection[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as HomepageSection);
        });

        // Self-healing: if any INITIAL_SECTIONS is missing, try to write it to Firestore and add to list
        let missingFound = false;
        for (const initialSec of INITIAL_SECTIONS) {
          if (!list.some(s => s.id === initialSec.id)) {
            try {
              await setDoc(doc(db, 'homepageContent', initialSec.id), initialSec);
            } catch (writeErr) {
              console.warn(`Could not self-heal missing section ${initialSec.id} (probably not an admin):`, writeErr);
            }
            list.push(initialSec);
            missingFound = true;
          }
        }

        return list.sort((a, b) => a.order - b.order);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'homepageContent');
      }
    }
    return getLocal<HomepageSection[]>('makosa_sections', INITIAL_SECTIONS).sort((a, b) => a.order - b.order);
  },

  async saveHomepageSection(section: HomepageSection): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        await setDoc(doc(db, 'homepageContent', section.id), section);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `homepageContent/${section.id}`);
      }
    }
    const sections = await this.getHomepageSections();
    const index = sections.findIndex(s => s.id === section.id);
    if (index > -1) {
      sections[index] = section;
    } else {
      sections.push(section);
    }
    setLocal('makosa_sections', sections);
  },

  async deleteHomepageSection(id: string): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        await deleteDoc(doc(db, 'homepageContent', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `homepageContent/${id}`);
      }
    }
    const sections = await this.getHomepageSections();
    const filtered = sections.filter(s => s.id !== id);
    setLocal('makosa_sections', filtered);
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    if (firebaseEnabled && db) {
      try {
        // If not logged in, return empty immediately instead of querying (prevents permission denied)
        if (!auth || !auth.currentUser) {
          return [];
        }

        let isAdmin = false;
        try {
          const idTokenResult = await auth.currentUser.getIdTokenResult();
          isAdmin = !!idTokenResult?.claims?.admin || auth.currentUser.email === 'farizhakimz7@gmail.com';
        } catch (e) {
          console.error("Error checking admin claims:", e);
          isAdmin = auth.currentUser.email === 'farizhakimz7@gmail.com';
        }

        const q = isAdmin 
          ? collection(db, 'orders') 
          : query(collection(db, 'orders'), where('userId', '==', auth.currentUser.uid));

        const querySnapshot = await getDocs(q);
        const list: Order[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Order);
        });
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    }
    return getLocal<Order[]>('makosa_orders', INITIAL_ORDERS).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    if (firebaseEnabled && db) {
      try {
        // If not logged in, return empty immediately
        if (!auth || !auth.currentUser) {
          return [];
        }
        const q = query(collection(db, 'orders'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const list: Order[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Order);
        });
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'orders');
      }
    }
    const orders = await this.getOrders();
    return orders.filter(o => o.userId === userId);
  },

  subscribeOrders(role: 'admin' | 'user', userId: string, callback: (orders: Order[]) => void): () => void {
    if (firebaseEnabled && db && auth) {
      try {
        const isAdmin = role === 'admin';
        const targetUserId = isAdmin ? userId : (auth.currentUser ? auth.currentUser.uid : userId);
        const q = isAdmin
          ? collection(db, 'orders')
          : query(collection(db, 'orders'), where('userId', '==', targetUserId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const list: Order[] = [];
          querySnapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Order);
          });
          const sorted = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(sorted);
        }, (err) => {
          console.error("Real-time orders sync error:", err);
        });
        return unsubscribe;
      } catch (err) {
        console.error("Real-time orders setup error:", err);
      }
    }
    const interval = setInterval(() => {
      const orders = getLocal<Order[]>('makosa_orders', INITIAL_ORDERS);
      const filtered = role === 'admin' ? orders : orders.filter(o => o.userId === userId);
      callback(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 2000);
    return () => clearInterval(interval);
  },

  async saveOrder(order: Order): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await runTransaction(db, async (transaction) => {
          const stockUpdates: { ref: any; newStock: number }[] = [];
          for (const item of order.items) {
            const productRef = doc(db, 'products', item.productId);
            const productSnap = await transaction.get(productRef);
            if (productSnap.exists()) {
              const productData = productSnap.data();
              const currentStock = productData?.stock || 0;
              const qtyToReduce = item.qty || 0;
              const newStock = Math.max(0, currentStock - qtyToReduce);
              stockUpdates.push({ ref: productRef, newStock });
            }
          }

          // Execute all writes after all reads have been completed
          transaction.set(orderRef, order);
          for (const update of stockUpdates) {
            transaction.update(update.ref, {
              stock: update.newStock,
              updatedAt: new Date().toISOString()
            });
          }
        });
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
      }
    }
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index > -1) {
      orders[index] = order;
    } else {
      orders.push(order);
    }
    setLocal('makosa_orders', orders);

    // Local storage fallback stock reduction
    const products = getLocal<Product[]>('makosa_products', INITIAL_PRODUCTS);
    order.items.forEach(item => {
      const pIndex = products.findIndex(p => p.id === item.productId);
      if (pIndex > -1) {
        products[pIndex].stock = Math.max(0, products[pIndex].stock - item.qty);
      }
    });
    setLocal('makosa_products', products);
  },

  async deleteOrder(id: string): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        await deleteDoc(doc(db, 'orders', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `orders/${id}`);
      }
    }
    const orders = await this.getOrders();
    const filtered = orders.filter(o => o.id !== id);
    setLocal('makosa_orders', filtered);
  },

  async updateOrderStatus(orderId: string, status: Order['status'], courier?: string, trackingNumber?: string): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        
        // Update status pesanan, kurir, dan nomor resi via updateDoc
        const orderUpdates: any = {
          status,
          updatedAt: new Date().toISOString()
        };
        if (courier !== undefined) orderUpdates.courier = courier;
        if (trackingNumber !== undefined) orderUpdates.trackingNumber = trackingNumber;

        await updateDoc(orderRef, orderUpdates);

        // 2. Tandai notifikasi admin terkait pesanan ini sebagai sudah dibaca (jika user adalah admin)
        let isAdminUser = false;
        try {
          const idTokenResult = await auth.currentUser?.getIdTokenResult();
          isAdminUser = !!idTokenResult?.claims?.admin || auth.currentUser?.email === 'farizhakimz7@gmail.com';
        } catch (e) {
          console.error("Error checking admin status for notifications:", e);
          isAdminUser = auth.currentUser?.email === 'farizhakimz7@gmail.com';
        }

        if (isAdminUser) {
          try {
            const adminNotifsQuery = query(
              collection(db, 'notifications'),
              where('recipientRole', '==', 'admin'),
              where('orderId', '==', orderId),
              where('isRead', '==', false)
            );
            const adminNotifsSnap = await getDocs(adminNotifsQuery);
            if (!adminNotifsSnap.empty) {
              const batch = writeBatch(db);
              adminNotifsSnap.docs.forEach((docSnap) => {
                batch.update(docSnap.ref, { isRead: true });
              });
              await batch.commit();
            }
          } catch (notifErr) {
            console.error("Gagal memperbarui status notifikasi admin:", notifErr);
          }
        }

        // 3. Buat notifikasi untuk customer
        try {
          const orderSnap = await getDoc(orderRef);
          const orderData = orderSnap.data() as Order;
          if (orderData && orderData.userId) {
            const getStatusText = (s: string) => {
              switch (s) {
                case 'menunggu_konfirmasi': return 'Menunggu Konfirmasi';
                case 'diproses': return 'Diproses';
                case 'dikirim': return 'Dikirim';
                case 'selesai': return 'Selesai';
                default: return s;
              }
            };

            const notifRef = doc(collection(db, 'notifications'));
            await setDoc(notifRef, {
              id: notifRef.id,
              recipientRole: 'user',
              recipientUserId: orderData.userId,
              message: `Pesanan Anda #${orderId} sekarang berstatus ${getStatusText(status)}.`,
              orderId: orderId,
              isRead: false,
              createdAt: new Date().toISOString()
            });
          }
        } catch (notifErr) {
          console.error("Gagal membuat notifikasi pembaruan status untuk customer:", notifErr);
        }

        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      }
    }
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
      orders[index].status = status;
      if (courier !== undefined) orders[index].courier = courier;
      if (trackingNumber !== undefined) orders[index].trackingNumber = trackingNumber;
      orders[index].updatedAt = new Date().toISOString();
      setLocal('makosa_orders', orders);
    }
  },

  // NOTIFICATIONS
  async getNotifications(role: 'admin' | 'user', userId?: string): Promise<InAppNotification[]> {
    if (firebaseEnabled && db) {
      try {
        if (!auth || !auth.currentUser) {
          return [];
        }

        let isAdmin = false;
        try {
          const idTokenResult = await auth.currentUser.getIdTokenResult();
          isAdmin = !!idTokenResult?.claims?.admin || auth.currentUser.email === 'farizhakimz7@gmail.com';
        } catch (e) {
          console.error("Error checking admin claims in notifications:", e);
          isAdmin = auth.currentUser.email === 'farizhakimz7@gmail.com';
        }

        let q;
        if (isAdmin) {
          q = query(collection(db, 'notifications'), where('recipientRole', '==', 'admin'));
        } else {
          q = query(collection(db, 'notifications'), where('recipientUserId', '==', auth.currentUser.uid));
        }

        const querySnapshot = await getDocs(q);
        const list: InAppNotification[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          if (data) {
            list.push({
              id: doc.id,
              recipientRole: data.recipientRole,
              recipientUserId: data.recipientUserId,
              message: data.message,
              orderId: data.orderId,
              isRead: data.isRead,
              createdAt: data.createdAt
            } as InAppNotification);
          }
        });
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'notifications');
      }
    }
    const localNotifs = getLocal<InAppNotification[]>('makosa_notifications', []);
    if (role === 'admin') {
      return localNotifs.filter(n => n.recipientRole === 'admin').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      return localNotifs.filter(n => n.recipientRole === 'user' && n.recipientUserId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  subscribeNotifications(role: 'admin' | 'user', userId: string, callback: (notifications: InAppNotification[]) => void): () => void {
    if (firebaseEnabled && db && auth) {
      try {
        const isAdmin = role === 'admin';
        const q = isAdmin
          ? query(collection(db, 'notifications'), where('recipientRole', '==', 'admin'))
          : query(collection(db, 'notifications'), where('recipientUserId', '==', auth.currentUser ? auth.currentUser.uid : userId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const list: InAppNotification[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            if (data) {
              list.push({
                id: docSnap.id,
                recipientRole: data.recipientRole,
                recipientUserId: data.recipientUserId,
                message: data.message,
                orderId: data.orderId,
                isRead: data.isRead,
                createdAt: data.createdAt
              } as InAppNotification);
            }
          });
          const sorted = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(sorted);
        }, (err) => {
          console.error("Real-time notifications sync error:", err);
        });
        return unsubscribe;
      } catch (err) {
        console.error("Real-time notifications setup error:", err);
      }
    }
    const interval = setInterval(() => {
      const localNotifs = getLocal<InAppNotification[]>('makosa_notifications', []);
      const filtered = role === 'admin' 
        ? localNotifs.filter(n => n.recipientRole === 'admin')
        : localNotifs.filter(n => n.recipientRole === 'user' && n.recipientUserId === userId);
      callback(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 2000);
    return () => clearInterval(interval);
  },

  async createNotification(notif: Omit<InAppNotification, 'id'>): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        const docRef = doc(collection(db, 'notifications'));
        const newNotif = { ...notif, id: docRef.id };
        await setDoc(docRef, newNotif);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'notifications');
      }
    }
    const localNotifs = getLocal<InAppNotification[]>('makosa_notifications', []);
    const newNotif: InAppNotification = { ...notif, id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
    localNotifs.push(newNotif);
    setLocal('makosa_notifications', localNotifs);
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (firebaseEnabled && db) {
      try {
        const docRef = doc(db, 'notifications', id);
        await updateDoc(docRef, { isRead: true });
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
      }
    }
    const localNotifs = getLocal<InAppNotification[]>('makosa_notifications', []);
    const index = localNotifs.findIndex(n => n.id === id);
    if (index > -1) {
      localNotifs[index].isRead = true;
      setLocal('makosa_notifications', localNotifs);
    }
  }
};

// AUTHENTICATION AND GOOGLE PROVIDER
export const authService = {
  isFirebaseEnabled(): boolean {
    return firebaseEnabled;
  },

  async loginWithGoogle(): Promise<UserProfile> {
    if (firebaseEnabled && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Fetch or create profile in Firestore
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        let profile: UserProfile;
        if (docSnap.exists()) {
          const existingData = docSnap.data() as UserProfile;
          // Only update name and photoUrl from Google if they have changed. Do not overwrite user-entered phone and address!
          const updates: Partial<UserProfile> = {};
          if (existingData.name !== user.displayName && user.displayName) {
            updates.name = user.displayName;
          }
          if (existingData.photoUrl !== user.photoURL && user.photoURL) {
            updates.photoUrl = user.photoURL;
          }
          
          if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates);
            profile = { ...existingData, ...updates };
          } else {
            profile = existingData;
          }
        } else {
          // New user sign up
          profile = {
            uid: user.uid,
            name: user.displayName || 'Pengguna Baru',
            email: user.email || '',
            photoUrl: user.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuJ5vxoE888QbH64AQzcZiMbkiwvCl9U2tIQyx0rN5HCTEIWQap0XeWun0cvvzYziIgzaQ1RGLvZxy_Ou3aj--luquUN5-O36XH0L-sPARE82295cXDRLe4TLRQwjfxdU4-EN1p-Wk6LXHesX8VjKSEgASNEHfW1tQuIvTKRFJMcIfHskPn2adTX5gGDvxEmthhg3-f90BP6Syf6PnTnY3vJuaFUQcx3EwUl1wRxSyyXC67x46pYx',
            phone: '',
            address: '',
            role: user.email === 'farizhakimz7@gmail.com' ? 'admin' : 'user', // auto-promote runtime user to admin as per instructions
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, profile);
        }
        
        // Sync local storage user profile as well
        setLocal('makosa_current_user', profile);
        
        try {
          const logRef = doc(collection(db, 'sessionLogs'));
          await setDoc(logRef, {
            id: logRef.id,
            userId: user.uid,
            userName: profile.name,
            userEmail: profile.email,
            loginAt: new Date().toISOString(),
            userAgent: navigator.userAgent
          });
        } catch (e) {
          console.error("Failed to write session log:", e);
        }

        return profile;
      } catch (err) {
        console.error("Google authentication failed:", err);
        throw err;
      }
    }
    
    // Local mock login fallback
    const mockUser: UserProfile = {
      uid: 'mock-user-1',
      name: 'Fariz Hakim',
      email: 'farizhakimz7@gmail.com',
      photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuJ5vxoE888QbH64AQzcZiMbkiwvCl9U2tIQyx0rN5HCTEIWQap0XeWun0cvvzYziIgzaQ1RGLvZxy_Ou3aj--luquUN5-O36XH0L-sPARE82295cXDRLe4TLRQwjfxdU4-EN1p-Wk6LXHesX8VjKSEgASNEHfW1tQuIvTKRFJMcIfHskPn2adTX5gGDvxEmthhg3-f90BP6Syf6PnTnY3vJuaFUQcx3EwUl1wRxSyyXC67x46pYx',
      phone: '+62 812-3456-7890',
      address: 'Jl. Melati No. 45, RT 03/RW 01, Desa Sukamaju, Kec. Cililin, Bandung Barat, 40562',
      role: 'admin', // promoted because email matches metadata
      createdAt: new Date().toISOString()
    };
    setLocal('makosa_current_user', mockUser);
    return mockUser;
  },

  async logout(): Promise<void> {
    if (firebaseEnabled && auth) {
      await fbSignOut(auth);
    }
    localStorage.removeItem('makosa_current_user');
  },

  getCurrentUser(): UserProfile | null {
    return getLocal<UserProfile | null>('makosa_current_user', null);
  },

  async getProfile(uid: string): Promise<UserProfile | null> {
    if (firebaseEnabled && db) {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as UserProfile;
        }
      } catch (err) {
        console.error("Failed to get profile from Firestore:", err);
      }
    }
    return null;
  },

  saveProfile(profile: UserProfile): void {
    if (firebaseEnabled && db) {
      const docRef = doc(db, 'users', profile.uid);
      setDoc(docRef, profile).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`));
    }
    setLocal('makosa_current_user', profile);
  },

  async getSessionLogs(): Promise<import('../types').SessionLog[]> {
    if (firebaseEnabled && db) {
      try {
        const q = query(collection(db, 'sessionLogs'), orderBy('loginAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as import('../types').SessionLog);
      } catch (e) {
        console.error("Failed to get session logs:", e);
        return [];
      }
    }
    return [];
  }
};

