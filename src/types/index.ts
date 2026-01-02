// ==========================================
// 1. USER & PROFILE (The People)
// ==========================================
export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: 'secretary' | 'admin';
  
  // Optional / Secretary Specific
  secretaryId?: string; 
  
  // Personal Details
  birthdate?: string;        // ISO Date "YYYY-MM-DD"
  baptismDate?: string;      // ISO Date "YYYY-MM-DD"
  isNewlyBaptized: boolean;  
  
  // Ministry Details
  duty?: string;             // Default duty (e.g. "Choir")
  adminStatus?: string;      // Custom admin tags
  status?: string;           // "Active", "Inactive"
  
  // NOTE: Age is calculated on the frontend, do not store it.
}

// ==========================================
// 2. EVENTS (The Schedule)
// ==========================================
export interface AppEvent {
  id: string;
  isActive: boolean;
  createdAt?: string;

  // Basic Info
  title: string;             // "Wednesday Prayer Meeting"
  type: 'service' | 'meeting' | 'special';
  date: string;              // "2025-10-20" (For one-time events)
  
  // Timing
  startTime: string;         // "19:00"
  endTime: string;           // "21:00"
  lateThreshold: string;     // "19:15"
  
  // Advanced Features
  scope: 'global' | 'local'; 
  secretaryId?: string;      // If local, who owns it?
  
  // Batches (The new feature for 4:30 AM / 6:00 PM slots)
  batches: string[];         
  
  // Repeater Config (Optional)
  recurrence?: {
    frequency: 'weekly' | 'daily';
    days: number[];          // 0=Sun, 1=Mon, etc.
  };
}

// Utility Type: What the Form needs (Everything in AppEvent EXCEPT system fields)
// This prevents "Form vs DB" conflicts.
export type EventFormInputs = Omit<AppEvent, 'id' | 'isActive' | 'createdAt' | 'scope' | 'secretaryId'>;


// ==========================================
// 3. ATTENDANCE (The Logs)
// ==========================================
export interface AttendanceRecord {
  id: string;
  userId: string;
  
  // 🚀 CRITICAL LINKING FIELDS
  eventId: string;           // Links to the specific AppEvent
  batch?: string;            // Which batch did they attend? (Optional)
  
  // Status
  status: 'present' | 'late' | 'absent';
  timeIn: string | null;     // ISO Timestamp or Time String
  timeOut: string | null;
  
  // Snapshot Data (Saved at the moment of check-in)
  date: string;              // Redundant but useful for fast queries "2025-10-20"
  dutySnapshot?: string;     // What duty did they perform *today*?
  markedBy?: 'system' | 'admin' | 'secretary';
  // ISO Timestamp of when the record was created/updated
  timestamp?: string;
}

// ⚠️ DEPRECATION NOTICE:
// We used to call this 'AttendanceLog'. 
// I am aliasing it here so your old code doesn't break, 
// but you should right-click 'AttendanceLog' -> Rename Symbol -> 'AttendanceRecord'
export type AttendanceLog = AttendanceRecord;