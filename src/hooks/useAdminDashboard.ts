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

  const loadData = async () => {
    setLoading(true);
    try {
      // 🚀 PARALLEL FETCHING: Get Users, Total Count, and Present Count all at once
      const [userResponse, totalRealCount, presentCount] = await Promise.all([
        AdminService.getPaginatedUsers(null), // Get first 50 users for the list
        AdminService.getTotalUserCount(),     // Get REAL total (e.g., 2000)
        AttendanceService.getTodayStats()     // Get today's attendance
      ]);

      setUsers(userResponse.users);

      // Fix: Calculate absent based on REAL total, not just the 50 we fetched
      const absentCount = Math.max(0, totalRealCount - presentCount);

      setAttendanceStats([
        { name: "Present", value: presentCount },
        { name: "Absent", value: absentCount },
      ]);
      
    } catch (error) {
      console.error("Error loading admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This cannot be undone.`)) return;
    
    try {
      await AdminService.deleteUser(userId);
      await loadData(); // Refresh list
      alert("User deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete user.");
    }
  };

  return {
    users,
    attendanceStats, // The Pie Chart data
    loading,
    seniorCount,
    juniorCount,
    handleDelete
  };
}