
import { 
  collection, getDocs, doc, getDoc, addDoc, query, where, orderBy, 
  limit, onSnapshot, serverTimestamp, setDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import { Restaurant, Review, ChatMessage, ReviewRating } from "../types";
import { MOCK_RESTAURANTS } from "../constants";

// --- Restaurants ---

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const q = query(collection(db, "restaurants"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Restaurant));
};

export const getRestaurantById = async (id: string): Promise<Restaurant | undefined> => {
  const d = await getDoc(doc(db, "restaurants", id));
  if (!d.exists()) return undefined;
  return { id: d.id, ...d.data() } as Restaurant;
};

// SEED FUNCTION: Call this to populate DB if empty
export const seedDatabase = async () => {
  for (const r of MOCK_RESTAURANTS) {
     const docRef = doc(db, "restaurants", r.id);
     const docSnap = await getDoc(docRef);
     if(!docSnap.exists()) {
       await setDoc(docRef, {
         ...r,
         createdAt: serverTimestamp()
       });
     }
  }
  console.log("Database seeded!");
  window.location.reload();
};

// --- Reviews ---

export const uploadReviewImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const addReviewToFirestore = async (
  restaurantId: string, 
  userId: string, 
  userName: string,
  ratings: ReviewRating, 
  text: string, 
  mediaUrls: string[],
  userLocation: { lat: number, lng: number }
) => {
  // Important: We set 'verified' to FALSE here.
  // The Cloud Function will calculate distance and set it to TRUE if valid.
  await addDoc(collection(db, "reviews"), {
    restaurantId,
    userId,
    userName, 
    ratings,
    text,
    mediaUrls,
    userLocation,
    createdAt: serverTimestamp(),
    verified: false, // Verification Pending
    helpfulCount: 0,
    flagged: false
  });
};

export const subscribeToReviews = (restaurantId: string, callback: (reviews: Review[]) => void) => {
  const q = query(
    collection(db, "reviews"), 
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snap) => {
    const reviews = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        timestamp: data.createdAt?.toMillis() || Date.now() 
      } as Review;
    });
    callback(reviews);
  });
};

// --- Chat ---

export const subscribeToChat = (roomId: string, callback: (msgs: ChatMessage[]) => void) => {
  const q = query(
    collection(db, "chats", "rooms", roomId, "messages"),
    orderBy("createdAt", "asc"),
    limit(50)
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        userName: data.userName,
        text: data.text,
        timestamp: data.createdAt?.toMillis() || Date.now(),
        channel: roomId,
        badges: data.userBadgeSnapshot || { local: false, traveler: true }
      } as ChatMessage;
    });
    callback(msgs);
  });
};

export const sendChatMessage = async (
  roomId: string, 
  text: string, 
  user: { uid: string, name: string, badges?: any }
) => {
  const messagesRef = collection(db, "chats", "rooms", roomId, "messages");
  await addDoc(messagesRef, {
    userId: user.uid,
    userName: user.name,
    text,
    createdAt: serverTimestamp(),
    userBadgeSnapshot: user.badges || {}
  });
};
