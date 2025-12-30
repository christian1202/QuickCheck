import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  query,
  where
} from "firebase/firestore";
import { db } from "../lib/firebase";
// FIX: Use 'import type' ensures no build errors
import type { UserProfile, AppEvent } from "../types";

const USERS_COLLECTION = "users";
const EVENTS_COLLECTION = "events";

export const AdminService = {
  // 1. Fetch All Users
  async getAllUsers(): Promise<UserProfile[]> {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  },

  // 2. Create Event 
  async createEvent(eventData: Omit<AppEvent, 'id'>) {
    await addDoc(collection(db, EVENTS_COLLECTION), eventData);
  },

  // 3. Close Event
  async closeEvent(eventId: string) {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, { isActive: false });
  },

  // 4. Get Active Events
  async getActiveEventsForToday() {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where("date", "==", today),
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppEvent));
  }
};