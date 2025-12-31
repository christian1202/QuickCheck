import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  query,
  where,
  deleteDoc,
  orderBy,
  getDoc,

} from "firebase/firestore";
import { db } from "../lib/firebase";
// FIX: Use 'import type' ensures no build errors
import type { UserProfile, AppEvent} from "../types";

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
  },
  // 5. Delete User
  async deleteUser(userId: string) {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  },

  // 6. Get ALL Events (Past & Future) sorted by newest first
  async getAllEvents() {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppEvent));
  },

  // 7. Delete an Event
  async deleteEvent(eventId: string) {
    await deleteDoc(doc(db, "events", eventId));
  },

  // 8. Get Single Event (to pre-fill the form)
  async getEventById(eventId: string) {
    const docRef = doc(db, "events", eventId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as AppEvent;
    }
    return null;
  },

  // 9. Update Event
  async updateEvent(eventId: string, updatedData: Partial<AppEvent>) {
    const docRef = doc(db, "events", eventId);
    await updateDoc(docRef, updatedData);
  },

  

};