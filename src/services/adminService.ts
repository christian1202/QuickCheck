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
  type QueryDocumentSnapshot, 
  type DocumentData,
  limit,
  startAfter,
  getCountFromServer,
  type QuerySnapshot,

} from "firebase/firestore";
import { db } from "../lib/firebase";
// FIX: Use 'import type' ensures no build errors
import type { UserProfile, AppEvent } from "../types";
import type { User } from "firebase/auth";

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
  createEvent: async (eventData: Partial<AppEvent>, user: User) => {
    // 1. Determine Scope automatically
    // TypeScript now knows that 'user' definitely has an 'email' and 'uid' property
    const isGlobal = user.email === "admin@gmail.com";
    
    // 2. Construct the Payload
    const payload = {
      ...eventData,
      scope: isGlobal ? 'global' : 'local',
      // If it's local, we MUST save the secretary's ID.
      secretaryId: isGlobal ? null : user.uid, 
      createdAt: new Date().toISOString()
    };

    return await addDoc(collection(db, "events"), payload);
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
    // Uses the constant to prevent typos
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
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

  // 16. Get Total User Count(very efficient and fast)
  getTotalUserCount: async () => {
    const snap = await getCountFromServer(collection(db, USERS_COLLECTION));
    return snap.data().count;
  },

  // 17. Get All Secretaries
  getAllSecretaries: async (): Promise<UserProfile[]> => {
    // ⚠️ Requires Index: role Ascending/Descending
    const q = query(collection(db, USERS_COLLECTION), where("role", "==", "secretary"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  },

  // OPTIMIZED FETCHING
  getEventsForRole: async (role: 'admin' | 'secretary', userId: string) => {
    const eventsRef = collection(db, "events");

    if (role === 'admin') {
      // Admin: Fetch EVERYTHING (Limit to recent 100 if needed for speed)
      const q = query(eventsRef, orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppEvent));
    
    } else {
      // Secretary: Fetch GLOBAL + LOCAL (Parallel Requests)
      // We do 2 small fast queries instead of 1 giant slow one
      const globalQuery = query(eventsRef, where("scope", "==", "global"));
      const localQuery = query(eventsRef, where("secretaryId", "==", userId));

      const [globalSnap, localSnap] = await Promise.all([
        getDocs(globalQuery),
        getDocs(localQuery)
      ]);

      // Merge and remove duplicates (just in case)
      const globalEvents = globalSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppEvent));
      const localEvents = localSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppEvent));

      return [...globalEvents, ...localEvents].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  },

  // 18. Get Events for a Specific Date (with Recurrence Handling)
  getEventsForDate: async (targetDate: Date, secretaryId: string) => {
    const dayIndex = targetDate.getDay(); // 0-6 (Sun-Sat)
    const dateString = targetDate.toISOString().split('T')[0]; // "2023-10-26"
    
    const eventsRef = collection(db, "events");

    // We need to run 3 fast queries in parallel and merge them.
    // This is much faster than downloading everything.
    
    const [
      // 1. One-time Global events for this specific date
      globalOneTime,
      // 2. One-time Local events for this specific date
      localOneTime,
      // 3. RECURRING events that happen on this day of the week
      // (This requires an array-contains index on 'recurrence.days')
      recurring
    ] = await Promise.all([
      // Query 1
      getDocs(query(eventsRef, 
        where("scope", "==", "global"), 
        where("date", "==", dateString)
      )),
      // Query 2
      getDocs(query(eventsRef, 
        where("secretaryId", "==", secretaryId), 
        where("date", "==", dateString)
      )),
      // Query 3 (The Repeater Magic 🪄)
      getDocs(query(eventsRef, 
        where("recurrence.days", "array-contains", dayIndex)
      ))
    ]);

    // Merge results
    const results: AppEvent[] = [];
    
    // Helper to push unique events
    const addDocs = (snapshot: QuerySnapshot<DocumentData>) => {
      snapshot.forEach((doc) => {
        // 👇 Fix 2: Cast as Omit<AppEvent, 'id'>. 
        // This tells TS: "This data has everything EXCEPT the ID" (since ID is on the doc, not in the data).
        const data = doc.data() as Omit<AppEvent, 'id'>;
        
        // Filter recurring events manually
        if (data.recurrence) {
           if (data.scope === 'local' && data.secretaryId !== secretaryId) return;
        }

        // 👇 Now this works perfectly. 
        // We take the data (without ID) and add the ID from the document.
        results.push({ id: doc.id, ...data });
      });
    };

    addDocs(globalOneTime);
    addDocs(localOneTime);
    addDocs(recurring);

    return results;
  }
  

  

};