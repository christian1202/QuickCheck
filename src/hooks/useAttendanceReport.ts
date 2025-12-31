import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useLocation } from "react-router-dom";
import { AdminService } from "../services/adminService";
import { AttendanceService } from "../services/attendanceService";
import type { UserProfile, AttendanceRecord } from "../types";

// 1. DEFINE TYPES LOCALLY TO AVOID 'ANY'
// This tells TypeScript: "A user is a Profile + an optional secretaryId"
interface ExtendedUser extends UserProfile {
  secretaryId?: string;
}

// This tells TypeScript exactly what strings are allowed
type StatusType = 'present' | 'late' | 'absent';

export function useAttendanceReport() {
  const location = useLocation();
  
  // 2. USE THE NEW TYPE IN STATE
  const [users, setUsers] = useState<ExtendedUser[]>([]); 
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scope, setScope] = useState<'global' | 'local'>(location.state?.scope || 'local');

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
        fetchedUsers = await AdminService.getMembersBySecretary(currentUser.uid);
      } else {
        fetchedUsers = await AdminService.getAllUsers();
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

  // 5. UPDATE STATUS FUNCTION
  const updateStatus = async (userId: string, newStatus: StatusType) => {
    const existingLog = logs.find(l => l.userId === userId);
    try {
      if (existingLog) {
        // We cast newStatus to satisfy the service call if strictly typed
        await AttendanceService.updateStatus(existingLog.id, newStatus);
      } else {
        // Don't create a record if we are marking them 'absent' on an empty log
        if (newStatus !== 'absent') {
          await AttendanceService.manualCheckIn(userId, selectedDate, newStatus);
        }
      }
      
      const updatedLogs = await AttendanceService.getRecordsByDate(selectedDate);
      setLogs(updatedLogs);
    } catch (err) { 
      console.error("Failed to update status:", err);
      alert("Action failed."); 
    }
  };

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

  const navigateDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
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
    deleteLog
  };
}