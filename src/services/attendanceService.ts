import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  limit,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { AttendanceRecord } from "../types";


const COLLECTION_NAME = "attendance_logs";
export type StatusType = 'present' | 'late' | 'absent';

export const AttendanceService = {
  // 1. Time In
  async timeIn(userId: string, eventId: string) {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.getTodayRecord(userId, eventId);
    if (existing) throw new Error("You have already timed in.");

    // 1. Fetch the specific event to get its late threshold
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);
    const eventData = eventSnap.data();

    const now = new Date();
    const currentTimeString = now.toTimeString().split(' ')[0].substring(0, 5); // Format: "HH:mm"

    // 2. Compare current time with event's late threshold (e.g., "08:15")
    // If no threshold is set, default to 'present'
    let status: 'present' | 'late' = 'present';
    if (eventData?.lateThreshold && currentTimeString > eventData.lateThreshold) {
      status = 'late';
    }

      await addDoc(collection(db, COLLECTION_NAME), {
        userId,
        eventId,
        date: today,
        timeIn: now.toISOString(),
        status: status
      });
  },

  // 2. Time Out
  async timeOut(recordId: string) {
    const recordRef = doc(db, COLLECTION_NAME, recordId);
    await updateDoc(recordRef, {
      timeOut: new Date().toISOString()
    });
  },

  // 3. Get Today's Record
  async getTodayRecord(userId: string, eventId: string): Promise<AttendanceRecord | null> {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      where("eventId", "==", eventId), // Check specific event
      where("date", "==", today),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    

    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as AttendanceRecord;
  },

  async getTodayStats() {
    const today = new Date().toISOString().split('T')[0];

    // Count records for today that are 'present' or 'late'
    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", "==", today),
      where("status", "in", ["present", "late"])
    );

    const snapshot = await getDocs(q);
    return snapshot.size; // Returns the number of people present
  },

  // 1. Get History for a Specific User (Student View)
  async getUserHistory(userId: string) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId)
      // We can sort by date later in the UI or use orderBy if we create an index
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  },

  // 2. Get All Logs for a Specific Date (Admin View)
  async getRecordsByDate(dateString: string) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", "==", dateString)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
  },

  // 3. Admin Manual Override (Fix Mistakes)
  async updateStatus(recordId: string, newStatus: 'present' | 'late' | 'absent') {
    // If setting to absent, we usually just delete the record in this logic
    if (newStatus === 'absent') {
      await deleteDoc(doc(db, COLLECTION_NAME, recordId));
    } else {
      await updateDoc(doc(db, COLLECTION_NAME, recordId), { status: newStatus });
    }
  },

  // 4. Admin Manual Add (For someone who forgot phone)
  async manualCheckIn(userId: string, dateString: string, status: 'present' | 'late') {
    // Check if record exists first to avoid duplicates
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      where("date", "==", dateString)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Update existing
      const docId = snapshot.docs[0].id;
      await updateDoc(doc(db, COLLECTION_NAME, docId), { status });
    } else {
      // Create new
      await addDoc(collection(db, COLLECTION_NAME), {
        userId,
        date: dateString,
        timeOut: null,
        status: status,
        timeIn: new Date().toISOString(), // Just use current time as placeholder
        markedBy: 'admin'
      });
    }
  },

  // 5. Delete Record
  deleteRecord: async (recordId: string) => {
    const ref = doc(db, "attendance", recordId);
    await deleteDoc(ref);
  },

  // Get attendance status for a specific user on a specific date
  getAttendanceForDate: async (dateString: string, userId: string) => {
      const q = query(
          collection(db, "attendance_logs"),
          where("date", "==", dateString),
          where("userId", "==", userId) // Assuming you save by userId
      );
      const snapshot = await getDocs(q);
      
      // Return a map for easy lookup: { "eventId1": "present", "eventId2": "absent" }
      const statusMap: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
          const data = doc.data();
          statusMap[data.eventId] = data.status; 
      });
      return statusMap;
  },

  // Mark attendance (used in bulk operations)
  markAttendance: async (date: string, status: string, userId: string, eventId: string) => {
    
    // Safety check
    if (!eventId) {
        console.error("❌ Attempted to save attendance without Event ID");
        return;
    }

    await addDoc(collection(db, "attendance_logs"), {
        date: date,
        status: status,
        userId: userId,
        eventId: eventId, // <--- 1. ADD THIS LINE
        timestamp: new Date().toISOString()
    });
  },


  

  
};