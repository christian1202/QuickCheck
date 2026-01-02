import { useState, useEffect, useMemo } from "react";
import { getAuth } from "firebase/auth";
import { useLocation } from "react-router-dom";
import { AdminService } from "../services/adminService";
import { AttendanceService } from "../services/attendanceService";
import type { UserProfile, AttendanceRecord, AppEvent } from "../types";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";


// 1. DEFINE TYPES LOCALLY TO AVOID 'ANY'
// This tells TypeScript: "A user is a Profile + an optional secretaryId"
interface ExtendedUser extends UserProfile {
  secretaryId?: string;
}



export function useAttendanceReport() {
  const location = useLocation();
  
  
  // 2. USE THE NEW TYPE IN STATE
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  

  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scope, setScope] = useState<'global' | 'local'>(location.state?.scope || 'local');

  // 👇 The Auto-Detected Events for that day
  const [availableEvents, setAvailableEvents] = useState<AppEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const [loading, setLoading] = useState(true);

  
  // 3. REFRESH DATA FUNCTION
  const refreshData = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const isSuperAdmin = currentUser.email === "admin@gmail.com";
      
      // 1. Determine the scope correctly
      const finalScope = isSuperAdmin ? (location.state?.scope || 'local') : 'local';
      
      // 2. ⚡️ FIX: Call setScope here so the state is actually used!
      setScope(finalScope);

      // 3. Fetch data based on that scope
      let fetchedUsers: UserProfile[];
      if (finalScope === 'local') {
        // Local scope just returns an array
        fetchedUsers = await AdminService.getMembersBySecretary(currentUser.uid);
        setHasMore(false);
      } else {
        // Global scope returns an object { users, lastVisible }
        // We called it 'getPaginatedUsers' in the service, so we must use that name here
        const response = await AdminService.getPaginatedUsers(null);
        
        fetchedUsers = response.users; // Extract the array
        setLastDoc(response.lastVisible); // Save the bookmark
        setHasMore(response.users.length === 50);
      }

      const dateLogs = await AttendanceService.getRecordsByDate(selectedDate);
      setUsers(fetchedUsers);
      setLogs(dateLogs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedDate]);

  useEffect(() => {
    detectEvents();
  }, [selectedDate]);




  // 🚀 READ OPTIMIZATION: Memoized Lookup Map
  // Instead of searching the array 1 million times, we build a "Dictionary" once.
  // Key: "eventId_userId" -> Value: Record
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    logs.forEach(log => {
      // Create a unique key for every single log entry
      const key = `${log.eventId}_${log.userId}`;
      map.set(key, log);
    });
    return map;
  }, [logs]);

  // 🚀 OPTIMIZED UPDATE FUNCTION
 const updateStatus = async (userId: string, status: 'present' | 'late' | 'absent') => {
    if (!selectedEvent) return;

    // 1. Optimistic Update (Instant UX)
    const optimisticLog: AttendanceRecord = {
      id: `${selectedEvent.id}_${userId}`,
      userId,
      eventId: selectedEvent.id,
      date: selectedDate,
      status,
      timestamp: new Date().toISOString(),
      timeIn: null, 
      timeOut: null
    };

    setLogs(prevLogs => {
      // Remove OLD log specifically for this User+Event
      const filtered = prevLogs.filter(l => 
        !(l.userId === userId && l.eventId === selectedEvent.id)
      );
      return [...filtered, optimisticLog];
    });

    // 2. Background Save
    AdminService.updateStatus(userId, status, selectedDate, selectedEvent.id)
      .catch(err => console.error("Save failed", err));
  };


  // 4. DELETE LOG FUNCTION
  const deleteLog = async (logId: string) => {
    if (!window.confirm("Remove this record?")) return;
    try {
      await AttendanceService.deleteRecord(logId);
      const updatedLogs = await AttendanceService.getRecordsByDate(selectedDate);
      setLogs(updatedLogs);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // 5. NAVIGATE DATE FUNCTION
  const navigateDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // 6. LOAD MORE USERS FOR PAGINATION
  const loadMoreUsers = async () => {
    if (!lastDoc || scope === 'local') return;

    const { users: nextUsers, lastVisible } = await AdminService.getPaginatedUsers(lastDoc);
  
    // Append new users to the existing list
    setUsers(prev => [...prev, ...nextUsers]);
    setLastDoc(lastVisible);
    setHasMore(nextUsers.length === 50);
  };

  
  // 7. AUTO-DETECT EVENTS FOR SELECTED DATE
  const detectEvents = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      // 🚀 Call the smart service
      const events = await AdminService.getEventsForDate(selectedDate);
      setAvailableEvents(events);

      // ✨ AUTO-SELECT MAGIC
      // If there is only 1 event today, automatically select it.
      if (events.length === 1) {
        setSelectedEvent(events[0]);
      } else {
        setSelectedEvent(null); // Let them choose if there are multiple
      }

    } catch (error) {
      console.error("Auto-detect failed", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    logs,
    loading,
    scope,
    selectedDate,
    setSelectedDate,
    navigateDate,
    updateStatus,
    deleteLog,
    hasMore,
    loadMoreUsers,
    availableEvents, // Pass this to the UI to show "No Event" or the List
    selectedEvent,
    setSelectedEvent,
    detectEvents,
    attendanceMap,
    
  };



}