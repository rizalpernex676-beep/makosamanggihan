import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
// Uses VITE_FIREBASE_PROJECT_ID
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

if (getApps().length === 0) {
  initializeApp({
    projectId: projectId,
  });
}

const db = getFirestore();
const auth = getAuth();

const app = express();
const PORT = 3000;

// Enable JSON bodies
app.use(express.json());

// 1. ADMIN STATUS UPDATE API ROUTE
// Direct admin endpoint that verifies role admin via decoded claims token before allowing status changes.
// It also allows the order owner to confirm "selesai" (order completed) because client security rules deny updates.
app.post('/api/admin/update-order', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Tidak diotorisasi: Token JWT tidak ditemukan.' });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (err) {
      return res.status(401).json({ error: 'Tidak diotorisasi: Token JWT tidak valid.' });
    }

    const { orderId, status, courier, trackingNumber } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: 'orderId dan status wajib dikirimkan.' });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return res.status(500).json({ error: 'Data pesanan kosong.' });
    }

    // Role verification: ONLY admin is allowed to update orders (status, courier, tracking)
    const isUserAdmin = decodedToken.admin === true;

    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Akses ditolak: Anda tidak memiliki hak akses administrator.' });
    }

    // Validation for "dikirim" status
    if (status === 'dikirim') {
      if (!courier || !trackingNumber) {
        return res.status(400).json({ error: 'Status "dikirim" memerlukan input kurir dan nomor resi.' });
      }
    }

    // Stock reduction transaction on transition to "diproses" for the first time
    if (status === 'diproses' && orderData.status === 'menunggu_konfirmasi') {
      try {
        await db.runTransaction(async (transaction) => {
          const freshOrderDoc = await transaction.get(orderRef);
          if (!freshOrderDoc.exists) {
            throw new Error(`Pesanan ${orderId} tidak ditemukan.`);
          }
          const freshOrderData = freshOrderDoc.data();
          if (!freshOrderData) {
            throw new Error(`Data pesanan ${orderId} kosong.`);
          }
          if (freshOrderData.status !== 'menunggu_konfirmasi') {
            throw new Error(`Status pesanan bukan "menunggu_konfirmasi", melainkan "${freshOrderData.status}".`);
          }

          // Check and reduce stock for each product in the order
          for (const item of freshOrderData.items || []) {
            const productRef = db.collection('products').doc(item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists) {
              throw new Error(`Produk "${item.name}" tidak ditemukan di katalog.`);
            }

            const productData = productDoc.data();
            const currentStock = productData?.stock ?? 0;
            const newStock = currentStock - item.qty;

            if (newStock < 0) {
              throw new Error(`Stok produk "${item.name}" tidak mencukupi (Tersedia: ${currentStock}, Dibutuhkan: ${item.qty}).`);
            }

            transaction.update(productRef, {
              stock: newStock,
              updatedAt: new Date().toISOString()
            });
          }

          const orderUpdates: any = {
            status: 'diproses',
            updatedAt: new Date().toISOString()
          };
          if (courier) orderUpdates.courier = courier;
          if (trackingNumber) orderUpdates.trackingNumber = trackingNumber;

          transaction.update(orderRef, orderUpdates);
        });
      } catch (transErr: any) {
        console.error('Stock reduction transaction failed:', transErr);
        return res.status(400).json({ error: transErr.message || 'Transaksi pengurangan stok gagal.' });
      }
    } else {
      // Normal update without stock changes
      const updates: any = {
        status,
        updatedAt: new Date().toISOString(),
      };

      if (courier) updates.courier = courier;
      if (trackingNumber) updates.trackingNumber = trackingNumber;

      await orderRef.update(updates);
    }

    // Auto mark-read unread admin notifications for this order (fixes MASALAH 3)
    try {
      const adminNotifsSnapshot = await db.collection('notifications')
        .where('recipientRole', '==', 'admin')
        .where('orderId', '==', orderId)
        .where('isRead', '==', false)
        .get();

      if (!adminNotifsSnapshot.empty) {
        const batch = db.batch();
        adminNotifsSnapshot.docs.forEach(docSnap => {
          batch.update(docSnap.ref, { isRead: true });
        });
        await batch.commit();
      }
    } catch (notifMarkErr) {
      console.error('Failed to auto-read admin notifications:', notifMarkErr);
    }

    // Create notification for the user
    try {
      const getStatusText = (s: string) => {
        switch (s) {
          case 'menunggu_konfirmasi': return 'Menunggu Konfirmasi';
          case 'diproses': return 'Diproses';
          case 'dikirim': return 'Dikirim';
          case 'selesai': return 'Selesai';
          default: return s;
        }
      };

      const notifRef = db.collection('notifications').doc();
      await notifRef.set({
        id: notifRef.id,
        recipientRole: 'user',
        recipientUserId: orderData.userId,
        message: `Pesanan Anda #${orderId} sekarang berstatus ${getStatusText(status)}.`,
        orderId: orderId,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (notifErr) {
      console.error('Failed to create user status update notification:', notifErr);
    }

    return res.json({ status: 'success', message: 'Status pesanan berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Admin Update Order Error:', error);
    return res.status(500).json({ error: 'Gagal memperbarui status pesanan.', message: error.message });
  }
});

// RAJAONGKIR (KOMERCE) API ROUTES
app.get('/api/destination/domestic-destination', async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) {
      return res.json({ code: "0200", message: "success", data: [] });
    }
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    if (!apiKey) {
      console.warn("RAJAONGKIR_API_KEY is missing on the server! Returning mockup destination for fallback.");
      // Return a nice fallback for demo when API key is not yet set
      const term = search.toString().toLowerCase();
      const mockDestinations = [
        { id: '68244', label: 'Getasan, Kabupaten Semarang, Jawa Tengah' },
        { id: '110', label: 'Senen, Kota Jakarta Pusat, DKI Jakarta' },
        { id: '220', label: 'Andir, Kota Bandung, Jawa Barat' },
        { id: '330', label: 'Tegalsari, Kota Surabaya, Jawa Timur' },
        { id: '440', label: 'Mlati, Kabupaten Sleman, DI Yogyakarta' },
        { id: '550', label: 'Banjarsari, Kota Surakarta, Jawa Tengah' },
      ];
      const filtered = mockDestinations.filter(d => d.label.toLowerCase().includes(term));
      return res.json({ code: "0200", message: "success", data: filtered });
    }

    const url = `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(search.toString())}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'key': apiKey,
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("RajaOngkir API failed:", response.status, errText);
      return res.status(response.status).json({ error: "RajaOngkir API error", details: errText });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error("RajaOngkir Destination Error:", err);
    return res.status(500).json({ error: "Gagal mengambil data tujuan dari RajaOngkir.", message: err.message });
  }
});

app.post('/api/calculate/domestic-cost', async (req, res) => {
  try {
    const { origin, destination, weight, courier } = req.body;
    if (!origin || !destination || !weight || !courier) {
      return res.status(400).json({ error: "Parameter origin, destination, weight, dan courier wajib dikirimkan." });
    }

    const apiKey = process.env.RAJAONGKIR_API_KEY;
    if (!apiKey) {
      console.warn("RAJAONGKIR_API_KEY is missing on the server! Returning fallback shipping costs.");
      // Return beautiful simulated shipping options
      const formattedWeightKg = Number(weight) / 1000;
      const jneCost = Math.round(15000 + formattedWeightKg * 8000);
      const jntCost = Math.round(13000 + formattedWeightKg * 9000);
      const sicepatCost = Math.round(14000 + formattedWeightKg * 7500);

      const mockRates = [
        {
          code: "jne",
          name: "Jalur Nugraha Ekakurir (JNE)",
          costs: [
            { service: "REG", description: "Layanan Reguler", cost: [{ value: jneCost, etd: "2-3 Hari" }] },
            { service: "YES", description: "Yakin Esok Sampai", cost: [{ value: jneCost + 10000, etd: "1 Hari" }] }
          ]
        },
        {
          code: "jnt",
          name: "J&T Express (J&T)",
          costs: [
            { service: "EZ", description: "Layanan Regular", cost: [{ value: jntCost, etd: "2-4 Hari" }] }
          ]
        },
        {
          code: "sicepat",
          name: "SiCepat Express",
          costs: [
            { service: "REG", description: "Layanan Reguler SiCepat", cost: [{ value: sicepatCost, etd: "2-3 Hari" }] },
            { service: "BEST", description: "Besok Sampai Tujuan", cost: [{ value: sicepatCost + 8000, etd: "1 Hari" }] }
          ]
        }
      ];
      return res.json({ code: "0200", message: "success", data: mockRates });
    }

     const url = `https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost`;
    const formData = new URLSearchParams();
    formData.append('origin', String(origin));
    formData.append('destination', String(destination));
    formData.append('weight', String(Number(weight)));
    formData.append('courier', String(courier));

    const response = await fetch(url, {
    method: 'POST',
    headers: {
    'key': apiKey,
    'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
  });

    if (!response.ok) {
      const errText = await response.text();
      console.error("RajaOngkir cost API failed:", response.status, errText);
      return res.status(response.status).json({ error: "RajaOngkir Cost API error", details: errText });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error("RajaOngkir Calculate Cost Error:", err);
    return res.status(500).json({ error: "Gagal menghitung ongkos kirim dari RajaOngkir.", message: err.message });
  }
});

// 4. VITE MIDDLEWARE / STATIC FILES MOUNT
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAKOSA backend running on http://localhost:${PORT}`);
  });
}

startServer();
