// firebase.js - Firebase Firestore 실시간 부부 동기화 설정
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "firebase/firestore";

// Firebase 설정 객체 (환경변수 또는 로컬 설정)
export function getFirebaseConfig() {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("datebaby_firebase_config");
    if (custom) {
      try {
        return JSON.parse(custom);
      } catch (e) {}
    }
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
}

let dbInstance = null;

export function getFirebaseDb() {
  if (dbInstance) return dbInstance;

  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.warn("Firebase Init Error:", error);
    return null;
  }
}

/**
 * 가족 코드(familyCode) 문서에 아기 프로필 및 마일스톤 데이터 저장
 */
export async function syncFamilyToCloud(familyCode, data) {
  const db = getFirebaseDb();
  if (!db || !familyCode) return false;

  try {
    const familyRef = doc(db, "datebaby_families", familyCode.trim().toLowerCase());
    await setDoc(
      familyRef,
      {
        ...data,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Firestore Save Error:", error);
    return false;
  }
}

/**
 * 실시간 가족 데이터 리스너 (남편이 수정하면 와이프 폰에 즉시 반영)
 */
export function listenToFamilyCloud(familyCode, onDataReceived) {
  const db = getFirebaseDb();
  if (!db || !familyCode) return () => {};

  try {
    const familyRef = doc(db, "datebaby_families", familyCode.trim().toLowerCase());
    const unsubscribe = onSnapshot(
      familyRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onDataReceived(data);
        }
      },
      (error) => {
        console.warn("Firestore Snapshot Error:", error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn("Firestore Listen Error:", error);
    return () => {};
  }
}
