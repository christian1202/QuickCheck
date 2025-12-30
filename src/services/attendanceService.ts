import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  limit
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { AttendanceRecord } from "../types";

const COLLECTION_NAME = "attendance_logs";

export const AttendanceService = {
  // 1. Time In
  async timeIn(userId: string, eventId: string) {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.getTodayRecord(userId, eventId);
    if (existing) throw new Error("You have already timed in.");

    const now = new Date();
    // Simple logic: Late if after 9 AM
    const isLate = now.getHours() >= 9; 

    await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      eventId,
      date: today,
      timeIn: now.toISOString(),
      timeOut: null,
      status: isLate ? 'late' : 'present'
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
  }

  
};