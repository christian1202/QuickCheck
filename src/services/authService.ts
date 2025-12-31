import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { UserProfile } from "../types";

export const AuthService = {
  async registerMemberManual(profileData: Omit<UserProfile, 'uid'>, secretaryId: string) {
    // Add member to the 'users' collection
    const docRef = await addDoc(collection(db, "users"), {
      ...profileData,
      secretaryId, // Tracks which secretary encoded this member
      role: 'student', 
      status: 'Active',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }
};