import { useEffect, useState } from "react";
import { AdminService } from "../../services/adminService";
import { AttendanceService } from "../../services/attendanceService";
// 👇 FIX 1: Use 'import type'
import type { UserProfile, AttendanceRecord } from "../../types";
import { useLocation } from "react-router-dom";

export default function AttendanceReport() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const scope = location.state?.scope || 'local';
  
  // Default to today's date
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // 👇 FIX 2: Define loadData INSIDE useEffect to fix dependency warnings
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Get ALL Users (The Master List)
        const allUsers = await AdminService.getAllUsers();
        
        // 2. Get Logs for the selected date
        const dateLogs = await AttendanceService.getRecordsByDate(selectedDate);
        
        setUsers(allUsers);
        setLogs(dateLogs);
      } catch (error) {
        // 👇 FIX 3: Actually use the error variable so ESLint doesn't complain
        console.error("Failed to load attendance report:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]); // This is now safe because loadData is defined inside

  const handleStatusChange = async (userId: string, newStatus: 'present' | 'late' | 'absent') => {
    try {
      const existingLog = logs.find(l => l.userId === userId);

      if (existingLog) {
        if (newStatus === 'absent') {
          await AttendanceService.updateStatus(existingLog.id, 'absent');
        } else {
          await AttendanceService.updateStatus(existingLog.id, newStatus);
        }
      } else {
        // Create new record (Manual Check-in)
        if (newStatus !== 'absent') {
            await AttendanceService.manualCheckIn(userId, selectedDate, newStatus);
        }
      }
      
      // We can't call loadData() here easily anymore, so we just reload the page or 
      // duplicate the fetch logic. For simplicity, let's trigger a re-fetch by toggling date
      // or just copy the fetch logic here.
      // A cleaner way is to just fetch logs again:
      const updatedLogs = await AttendanceService.getRecordsByDate(selectedDate);
      setLogs(updatedLogs);

    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Daily Attendance Report
          {scope === 'global' ? "Global System Report" : "My Local Report"}
        </h1>
        
        {/* Date Picker */}
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={4} className="p-8 text-center">Loading data...</td></tr>
            ) : (
              users.map((user) => {
                const log = logs.find(l => l.userId === user.uid);
                const status = log ? log.status : 'absent';

                return (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                       Member
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        status === 'present' ? 'bg-green-100 text-green-700' :
                        status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {status}
                      </span>
                    </td>

                    <td className="px-6 py-4 flex gap-2">
                       {status !== 'present' && (
                         <button 
                           onClick={() => handleStatusChange(user.uid, 'present')}
                           className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200 hover:bg-green-100"
                         >
                           Mark Present
                         </button>
                       )}
                       {status !== 'absent' && (
                         <button 
                           onClick={() => handleStatusChange(user.uid, 'absent')}
                           className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                         >
                           Mark Absent
                         </button>
                       )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}