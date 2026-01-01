import { useState, useEffect } from "react";
import { AdminService } from "../services/adminService";
import { AttendanceService } from "../services/attendanceService";
import type { UserProfile } from "../types";
import { calculateAge, getUserCategory } from "../lib/utils";

export function useAdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  // Store chart data in state
  const [attendanceStats, setAttendanceStats] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Derived stats (Calculated on the fly)
  const seniorCount = users.filter(u => getUserCategory(calculateAge(u.birthdate)) === 'Senior').length;
    const juniorCount = users.filter(u => getUserCategory(calculateAge(u.birthdate)) === 'Junior').length;
    
    const [secretaries, setSecretaries] = useState<UserProfile[]>([]);
    const [selectedSecretary, setSelectedSecretary] = useState<string | null>(null);

    // ... inside useAdminDashboard hook ...

    const updateStats = (total: number, present: number) => {
        const absent = Math.max(0, total - present);
        setAttendanceStats([
        { name: "Present", value: present },
        { name: "Absent", value: absent },
        ]);
    };
    
    useEffect(() => {
        loadInitialData();
    }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 🚀 PARALLEL FETCHING: 4 Requests at once
      const [userRes, totalCount, presentCount, secList] = await Promise.all([
        AdminService.getPaginatedUsers(null),
        AdminService.getTotalUserCount(),
        AttendanceService.getTodayStats(),
        AdminService.getAllSecretaries() 
      ]);

      // 1. Save Users
      setUsers(userRes.users);
      
      // 2. Save Secretaries (The fix!)
      setSecretaries(secList); 

      // 3. Update Stats (Clean helper function)
      updateStats(totalCount, presentCount);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    };
    
  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Delete ${userName}?`)) return;
    
    try {
      await AdminService.deleteUser(userId);
      
      // 👇 FIXED: Call handleFilterChange instead of 'loadData'
      // This refreshes the current view (whether you are on Global or Secretary view)
      await handleFilterChange(selectedSecretary || ""); 
      
      alert("User deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete user.");
    }
  };

  const handleFilterChange = async (secretaryId: string) => {
    setLoading(true);
    try {
      if (secretaryId === "") {
        // RESET: User wants to see Global List
        setSelectedSecretary(null);
        const res = await AdminService.getPaginatedUsers(null);
        setUsers(res.users);
      } else {
        // FILTER: User selected a specific secretary
        setSelectedSecretary(secretaryId);
        // Reuse the existing function you already have!
        const secMembers = await AdminService.getMembersBySecretary(secretaryId);
        setUsers(secMembers);
      }
    } catch (error) {
      console.error("Filter failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    attendanceStats, // The Pie Chart data
    loading,
    seniorCount,
    juniorCount,
    handleDelete,
    secretaries,      // 👈 Export
    selectedSecretary,// 👈 Export
    handleFilterChange,// 👈 Export
  };
}