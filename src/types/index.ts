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
  status?: string; // 👈 Add this line
 
  
  // NOTE: Age and Category are NOT stored. 
  // We calculate them in the UI/Service layer.
}

// src/types/index.ts

// 1. The Event Definition
export interface AppEvent {
  id: string;
  title: string;          // e.g., "Wednesday Prayer Meeting"
  date: string;           // "2023-12-25"
  startTime: string;      // "19:00"
  endTime: string;        // "21:00"
  type: 'service' | 'meeting' | 'special'; // Helps with coloring charts later
  isActive: boolean;      // Admin can manually "Close" the attendance
}

// 2. Updated Attendance Record
export interface AttendanceRecord {
  id: string;
  userId: string;
  eventId: string;     // 👈 CRITICAL: Links this record to a specific event
  timeIn: string | null;
  timeOut: string | null;
  status: 'present' | 'late' | 'absent';
  duty?: string;       // 👈 The duty they performed *for this specific event*
}