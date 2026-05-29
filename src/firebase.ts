
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocFromServer, 
  addDoc,
  serverTimestamp,
  Firestore 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  sendPasswordResetEmail as fbSendPasswordResetEmail
} from 'firebase/auth';
import firebaseConfig from './firebase-applet-config.json';

// Configuration is loaded from local file
if (!firebaseConfig || !firebaseConfig.projectId) {
  console.error("Firebase configuration is missing or invalid.");
}

// Initialize Firebase SDK
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Determine database ID and initialize appropriately
const dbId = (firebaseConfig as any).firestoreDatabaseId;
const databaseId = (dbId && dbId !== "" && dbId !== "default" && dbId !== "(default)") ? dbId : "(default)";

// Resilience: Use getFirestore for default, initializeFirestore for custom db instances
export const db = (databaseId === "(default)") 
  ? getFirestore(app) 
  : initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, databaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore with retries
export async function testFirestoreConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // Use a simple getDoc from a known path
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("✅ Firestore connection successful");
      return;
    } catch (error) {
      console.warn(`Connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        if (error instanceof Error && error.message.includes('offline')) {
          console.error("❌ Please check your Firebase configuration. The client is offline.");
        } else {
          console.error("❌ Firestore connection failed after retries:", error);
        }
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp,
  fbSendPasswordResetEmail as sendPasswordResetEmail
};
export type { FirebaseUser };
