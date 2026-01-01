import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { AdminService } from "../services/adminService";
import type { UserProfile } from "../types";
import { calculateAge, getUserCategory } from "../lib/utils";

export function useSecretaryDashboard() {
  const [myMembers, setMyMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stats State
  const [stats, setStats] = useState({ senior: 0, junior: 0, total: 0 });
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);

  const refreshMembers = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        // 1. Fetch ONLY my members
        const members = await AdminService.getMembersBySecretary(user.uid);
        setMyMembers(members as UserProfile[]);

        // 2. Calculate Stats Locally (No need for extra API calls)
        let sCount = 0;
        let jCount = 0;

        members.forEach((m) => {
          const age = calculateAge(m.birthdate);
          const cat = getUserCategory(age);
          if (cat === 'Senior') sCount++;
          if (cat === 'Junior') jCount++;
        });

        setStats({ senior: sCount, junior: jCount, total: members.length });
        
        // 3. Prepare Chart Data
        setChartData([
          { name: "Seniors", value: sCount },
          { name: "Juniors", value: jCount },
        ]);
      }
    } catch (error) {
      console.error("Failed to load secretary's members", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMembers();
  }, []);

  // Simple delete wrapper
  const handleDelete = async (id: string, name: string) => {
    if(!window.confirm(`Remove ${name} from your list?`)) return;
    try {
       await AdminService.deleteUser(id);
       refreshMembers(); // Refresh after delete
    } catch(e) { console.error(e); }
  };

  return { 
    myMembers, 
    loading, 
    refreshMembers, 
    stats, 
    chartData,
    handleDelete
  };
}