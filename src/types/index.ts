// src/types/index.ts

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;        
  timeIn: string | null;      
  timeOut: string | null; 
  status: 'present' | 'late' | 'absent';
  markedBy?: 'system' | 'admin'; // Track if admin forced this
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'student' | 'admin';
  fullName: string;
  
  // New Fields requested
  baptismDate?: string;      // ISO Date String
  isNewlyBaptized: boolean;  
  duty?: string;             // e.g., "Choir", "Usher"
  adminStatus?: string;      // The custom status admin fills out
  birthdate?: string;        // ISO Date String (YYYY-MM-DD)
  
  // NOTE: Age and Category are NOT stored. 
  // We calculate them in the UI/Service layer.
}