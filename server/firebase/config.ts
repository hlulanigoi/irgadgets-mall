import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseAdmin: admin.app.App;

export function initializeFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    // In production, use service account from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'designspark-a0254',
      });
    } else {
      // For development, use application default credentials or mock
      console.log('⚠️  Firebase Admin: No service account provided, using application default credentials');
      firebaseAdmin = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'designspark-a0254',
      });
    }

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      firebaseAdmin = admin.app();
    } else {
      console.error('❌ Firebase Admin initialization error:', error);
      throw error;
    }
  }

  return firebaseAdmin;
}

export function getFirebaseAdmin() {
  if (!firebaseAdmin) {
    return initializeFirebaseAdmin();
  }
  return firebaseAdmin;
}

export const auth = () => getFirebaseAdmin().auth();
