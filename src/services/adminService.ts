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
  type QueryDocumentSnapshot, // 👈 Fix for "unexpected any"
  type DocumentData,
  limit,
  startAfter,
  getCountFromServer,

} from "firebase/firestore";
import { db } from "../lib/firebase";
// FIX: Use 'import type' ensures no build errors
import type { UserProfile, AppEvent} from "../types";

const USERS_COLLECTION = "users";
const EVENTS_COLLECTION = "events";




export const AdminService = {
  // 1. Fetch All Users
  // Returns Users AND the Last Document (to use as a bookmark)
 getPaginatedUsers: async (lastDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    const pageSize = 50;
    let q;

    if (lastDoc) {
      // Get next 50 after the last one we saw
      q = query(
        collection(db, USERS_COLLECTION), // 👈 Used the constant here
        orderBy("fullName"), 
        startAfter(lastDoc), 
        limit(pageSize)
      );
    } else {
      // Get first 50
      q = query(
        collection(db, USERS_COLLECTION), // 👈 Used the constant here
        orderBy("fullName"), 
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    
    // Get the last document to use as our next "bookmark"
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    
    const users = snapshot.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data() 
    } as UserProfile));

    return { users, lastVisible };
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

  // 10. Get Single User
  getUser: async (userId: string): Promise<UserProfile | null> => {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    return userDoc.exists() ? { uid: userDoc.id, ...userDoc.data() } as UserProfile : null;
  },

  // 11. Delete Attendance Record
  deleteRecord: async (recordId: string) => {
    try {
      const recordRef = doc(db, "attendance", recordId);
      await deleteDoc(recordRef);
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  },

  
  // 12. Update Attendance Status
  // (Optional: Ensure updateStatus is robust)
  updateStatus: async (recordId: string, newStatus: string) => {
    const recordRef = doc(db, "attendance", recordId);
    await updateDoc(recordRef, { status: newStatus });
  },
  
  // 13. Get Members by Secretary (for 'local' scope)
  getMembersBySecretary: async (secretaryId: string): Promise<UserProfile[]> => {
    const q = query(
      collection(db, USERS_COLLECTION), 
      where("secretaryId", "==", secretaryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  },

  // 14. Get Dashboard Stats (ultra-efficient way)
  getDashboardStats: async () => {
    try {
      // This asks Firebase: "Just tell me the number, don't give me the data."
      // Cost: 1 read. Speed: Instant.
      const coll = collection(db, USERS_COLLECTION);
      const snapshot = await getCountFromServer(coll);
      
      return {
        totalUsers: snapshot.data().count,
        // You can add other stats here later (e.g., totalAbsent)
      };
    } catch (error) {
      console.error("Stats Error:", error);
      return { totalUsers: 0 };
    }
  },

  // 15. Get Recent Users (last 5 signed up)
  getRecentUsers: async () => {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy("createdAt", "desc"), // ⚠️ Requires "createdAt" field & Index
      limit(5)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  },

  

  

};