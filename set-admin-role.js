#!/usr/bin/env node

/**
 * MAKOSA Admin Role Provisioning Script
 * 
 * Usage:
 *   node set-admin-role.js <uid>
 * 
 * Make sure you have set the GOOGLE_APPLICATION_CREDENTIALS environment variable
 * pointing to your Firebase Service Account JSON file.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const uid = process.argv[2];

if (!uid) {
  console.error('\x1b[31mError: Mohon berikan UID pengguna.\x1b[0m');
  console.log('Usage: node set-admin-role.js <uid>');
  process.exit(1);
}

try {
  // Try initializing with Application Default Credentials
  admin.initializeApp({
    projectId: 'makosa-e7b4b'
  });
  console.log('Firebase Admin SDK diinisialisasi menggunakan Default Credentials.');
} catch (error) {
  try {
    // Fallback: If service account is available locally
    admin.initializeApp();
  } catch (err) {
    console.error('\x1b[31mGagal menginisialisasi Firebase Admin SDK.\x1b[0m');
    console.error(err);
    process.exit(1);
  }
}

async function setAdminRole(userUid) {
  try {
    // Verify user exists first
    const userRecord = await admin.auth().getUser(userUid);
    console.log(`Mengatur role admin untuk pengguna: ${userRecord.displayName || 'No Name'} (${userRecord.email})`);

    // Set custom user claims
    await admin.auth().setCustomUserClaims(userUid, { admin: true });
    
    console.log('\x1b[32m✔ Sukses! Custom claim { admin: true } telah berhasil diberikan.\x1b[0m');
    console.log('Pengguna harus melogout dan login kembali agar klaim baru aktif.');
  } catch (error) {
    console.error('\x1b[31mGagal memberikan role admin:\x1b[0m');
    console.error(error);
  }
}

setAdminRole(uid);
