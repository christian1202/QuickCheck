import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AdminService } from "../../services/adminService";
import { AttendanceService } from "../../services/attendanceService";
import { getAuth } from "firebase/auth"; 
import type { UserProfile, AttendanceRecord } from "../../types";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useAttendanceReport } from "../../hooks/useAttendanceReport";

interface ExtendedUser extends UserProfile {
  secretaryId?: string;
}

export default function AttendanceReport() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const { 
      navigateDate, updateStatus, deleteLog 
  } = useAttendanceReport();
  
  const location = useLocation();
  // We still try to get scope from navigation, but we will override it below if needed
  let scope = location.state?.scope || 'local';
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
           setLoading(false);
           return;
        }

        // 🔒 SECURITY GUARDRAIL 🔒
        // If the logged-in user is NOT the super admin, FORCE scope to 'local'.
        // This prevents them from ever seeing the Global list.
        const isSuperAdmin = currentUser.email === "admin@gmail.com"; 
        
        if (!isSuperAdmin) {
          scope = 'local'; 
        }

        // 1. Fetch Data
        let fetchedUsers = await AdminService.getAllUsers() as ExtendedUser[];
        const dateLogs = await AttendanceService.getRecordsByDate(selectedDate);
        
        // 2. Filter Logic
        if (scope === 'local') {
          // DEBUGGING: Check the console to see what's happening
          console.log("Filtering for Secretary ID:", currentUser.uid);
          
          fetchedUsers = fetchedUsers.filter(u => {
             // We keep the user ONLY if their secretaryId matches MINE
             return u.secretaryId === currentUser.uid;
          });
        } 

        setUsers(fetchedUsers);
        setLogs(dateLogs);
        
      } catch (error) {
        console.error("Failed to load report:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  

  // ... (Keep handleStatusChange and Render exactly the same) ...

  // RENDER (Just the return part for context)
  if (loading) return <div className="p-8">Loading Report...</div>;

 return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {scope === 'global' ? "🌍 Global Report" : "📍 Local Report"}
          </h1>
          <p className="text-sm text-gray-500">
            {scope === 'global' ? "System-wide records" : `Managing ${users.length} local members`}
          </p>
        </div>

        {/* DATE CONTROLS */}
        <div className="flex items-center gap-2 bg-white p-1 border rounded-lg shadow-sm">
          <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded"><ChevronLeft size={20}/></button>
          
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-2 py-1 outline-none font-semibold text-gray-700 bg-transparent"
            />
            <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"/>
          </div>

          <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
             <tr>
               <th className="px-6 py-4">Name</th>
               <th className="px-6 py-4">Current Status</th>
               <th className="px-6 py-4 text-right">Actions</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {users.map(user => {
               const log = logs.find(l => l.userId === user.uid);
               const status = log?.status || 'no-record';

               return (
                 <tr key={user.uid} className="hover:bg-gray-50">
                   <td className="px-6 py-4 font-medium">{user.fullName}</td>
                   
                   <td className="px-6 py-4">
                     <StatusBadge status={status} />
                   </td>

                   <td className="px-6 py-4 flex justify-end gap-2">
                     {/* QUICK TOGGLES */}
                     <div className="flex bg-gray-100 rounded p-1">
                       {['present', 'late', 'absent'].map((s) => (
                         <button
                           key={s}
                           onClick={() => updateStatus(user.uid, s as 'present' | 'late' | 'absent')}
                           className={`px-3 py-1 text-xs font-bold rounded capitalize ${
                             status === s ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'
                           }`}
                         >
                           {s[0]}
                         </button>
                       ))}
                     </div>

                     {/* DELETE BUTTON */}
                     {log && (
                       <button onClick={() => deleteLog(log.id)} className="p-2 text-gray-400 hover:text-red-500">
                         <Trash2 size={16} />
                       </button>
                     )}
                   </td>
                 </tr>
               );
             })}
             {users.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-gray-400">No members found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper Component (Keep in same file as view)
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'present': 'bg-green-100 text-green-700 border-green-200',
    'late': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'absent': 'bg-red-100 text-red-700 border-red-200',
    'no-record': 'bg-gray-100 text-gray-500 border-gray-200'
  };
  
  // Fallback to 'no-record' style if status is unknown
  const currentStyle = styles[status] || styles['no-record'];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {status === 'no-record' ? 'Not Checked In' : status.toUpperCase()}
    </span>
  );
}