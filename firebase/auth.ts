
// Importing from @firebase/auth to avoid circular dependency with this file (firebase/auth.ts)
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser
} from "@firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { User } from "../types";
import { useEffect, useState } from "react";

// Helper to map Firebase Auth User + Firestore Profile to App User
const mapUser = async (fbUser: FirebaseUser): Promise<User> => {
  const userDocRef = doc(db, "users", fbUser.uid);
  const userSnap = await getDoc(userDocRef);
  const userData = userSnap.data();

  return {
    id: fbUser.uid,
    name: fbUser.displayName || userData?.name || "Traveler",
    email: fbUser.email || "",
    avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${fbUser.displayName || 'User'}&background=1d4ed8&color=fff&bold=true`,
    isAdmin: false, // Can be expanded later via Custom Claims
    contributionsCount: userData?.contributionsCount || 0,
    badges: userData?.badges || { local: false, traveler: true, communityTrusted: false }
  };
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const mappedUser = await mapUser(fbUser);
          setUser(mappedUser);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
};

export const logoutUser = () => signOut(auth);

export const loginUser = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

export const registerUser = async (email: string, pass: string, name: string, isLocal: boolean) => {
  // 1. Create Auth User
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  
  // 2. Update Auth Profile Name
  await updateProfile(cred.user, { displayName: name });

  // 3. Create Firestore User Profile
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    name,
    email,
    trustLevel: 0,
    contributionsCount: 0,
    badges: {
      local: isLocal,
      traveler: !isLocal,
      communityTrusted: false
    },
    createdAt: serverTimestamp()
  });

  return cred.user;
};
