import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Define the interface to clear the 'any' error
interface SecretaryData {
  fullName: string;
  email: string;
  birthdate: string;
  password?: string;
}

interface MemberProfileData {
  fullName: string;
  email: string;
  birthdate: string;
  duty: string;
  role: 'student';
  status: 'Active';
}

export const AuthService = {
  // Use for secretaries who need their OWN login
  async registerSecretary(data: SecretaryData) {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password!);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      fullName: data.fullName,
      email: data.email,
      birthdate: data.birthdate,
      role: 'secretary',
      status: 'Active',
      createdAt: new Date().toISOString()
    });

    return uid;
  },

  // Use for manual member registration (Adds the missing function)
async registerMemberManual(profileData: MemberProfileData, secretaryId: string) {
    const docRef = await addDoc(collection(db, "users"), {
      ...profileData,
      secretaryId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }
};