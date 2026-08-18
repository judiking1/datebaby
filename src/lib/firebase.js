// firebase.js - Firebase Firestore 및 Auth 실시간 부부 동기화 설정
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

// Firebase 기본 설정 객체 (Vercel 환경변수 또는 fallback)
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
    apiKey:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      "AIzaSyA753FQIVHwW_twECUucXsJQaTYXjo1Y58",
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "datebaby.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "datebaby",
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      "datebaby.firebasestorage.app",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "184826373361",
    appId:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
      "1:184826373361:web:c490939b83fcf5101ff550",
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MD71PT9CP9"
  };
}

let appInstance = null;
let dbInstance = null;
let authInstance = null;

export function getFirebaseApp() {
  if (appInstance) return appInstance;
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) return null;

  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(config);
    return appInstance;
  } catch (e) {
    console.warn("Firebase App Init Error:", e);
    return null;
  }
}

export function getFirebaseDb() {
  if (dbInstance) return dbInstance;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.warn("Firestore Init Error:", error);
    return null;
  }
}

export function getFirebaseAuth() {
  if (authInstance) return authInstance;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    authInstance = getAuth(app);
    return authInstance;
  } catch (error) {
    console.warn("Firebase Auth Init Error:", error);
    return null;
  }
}

/**
 * Google 1초 간편 로그인
 */
export async function loginWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth가 초기화되지 않았습니다.");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * 이메일 / 비밀번호 로그인
 */
export async function loginWithEmail(email, password) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth가 초기화되지 않았습니다.");
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

/**
 * 이메일 / 비밀번호 회원가입
 */
export async function registerWithEmail(email, password, displayName) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth가 초기화되지 않았습니다.");
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

/**
 * 카카오 / 네이버 웹 간편 로그인 (시뮬레이션 및 계정 생성 지원)
 */
export async function loginWithSocialProvider(providerName, defaultEmail = "") {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth가 초기화되지 않았습니다.");
  
  // 소셜 로그인 프로필 자동 생성 및 게스트/이메일 세션 매핑
  const tempEmail = defaultEmail || `${providerName}_user_${Date.now()}@datebaby.app`;
  const tempPass = "DateBabySocialAuth!2026";
  try {
    const user = await registerWithEmail(tempEmail, tempPass, `${providerName} 회원`);
    return user;
  } catch (e) {
    // 이미 있는 경우 로그인
    const user = await loginWithEmail(tempEmail, tempPass);
    return user;
  }
}

/**
 * 익명 게스트 1초 즉시 로그인
 */
export async function loginAsGuest() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth가 초기화되지 않았습니다.");
  const result = await signInAnonymously(auth);
  return result.user;
}

/**
 * 로그아웃
 */
export async function logoutUser() {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
}

/**
 * 가족 코드(familyCode) 문서에 아기 프로필, 데일리 로그, 마일스톤, 예방접종 등 실시간 저장
 */
export async function syncFamilyToCloud(familyCode, data) {
  const db = getFirebaseDb();
  if (!db || !familyCode) return false;

  try {
    const cleanCode = familyCode.trim().toLowerCase();
    const familyRef = doc(db, "datebaby_families", cleanCode);
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
    const cleanCode = familyCode.trim().toLowerCase();
    const familyRef = doc(db, "datebaby_families", cleanCode);
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
