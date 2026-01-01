import { Calendar as CalendarIcon, ChevronLeft, ChevronRight} from "lucide-react";
import { useAttendanceReport } from "../../hooks/useAttendanceReport";

export default function AttendanceReport() {
  const { 
    users, logs, loading, scope, selectedDate, hasMore,
    setSelectedDate, navigateDate, updateStatus,loadMoreUsers 
  } = useAttendanceReport();

  if (loading) return <div className="p-8 text-gray-500">Loading System...</div>;

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

        {/* 👇 HERE IS THE DATE PICKER (SECRETARY CAN PICK ANY DATE) 👇 */}
        <div className="flex items-center gap-2 bg-white p-1 border rounded-lg shadow-sm">
          {/* Go Back 1 Day */}
          <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft size={20}/>
          </button>
          
          {/* The Calendar Input */}
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate} 
              // When this changes, the whole table updates automatically
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-2 py-1 outline-none font-semibold text-gray-700 bg-transparent"
            />
            <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"/>
          </div>

          {/* Go Forward 1 Day */}
          <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight size={20}/>
          </button>
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
                   <td className="px-6 py-4"><StatusBadge status={status} /></td>
                   
                   {/* 👇 HERE ARE THE EDIT BUTTONS (P / L / A) 👇 */}
                   <td className="px-6 py-4 flex justify-end gap-2">
                     <div className="flex bg-gray-100 rounded p-1">
                       {/* This loop creates 3 buttons: Present, Late, Absent */}
                       {['present', 'late', 'absent'].map((s) => (
                         <button
                           key={s}
                           // Clicking this INSTANTLY updates the database
                           onClick={() => updateStatus(user.uid, s as 'present' | 'late' | 'absent')}
                           className={`px-3 py-1 text-xs font-bold rounded capitalize ${
                             status === s ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'
                           }`}
                           title={`Mark as ${s}`} // Hover tooltip
                         >
                           {s[0].toUpperCase()} {/* Shows P, L, or A */}
                         </button>
                       ))}
                     </div>
                   </td>
                 </tr>
               );
             })}
          </tbody>
        </table>
        
        {/* Load More Button (Only for Global Admin) */}
        {scope === 'global' && hasMore && (
          <div className="p-4 flex justify-center border-t bg-gray-50">
            <button onClick={loadMoreUsers} className="px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Load Next 50 Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper for Badge Colors
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'present': 'bg-green-100 text-green-700 border-green-200',
    'late': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'absent': 'bg-red-100 text-red-700 border-red-200',
    'no-record': 'bg-gray-100 text-gray-500 border-gray-200'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles['no-record']}`}>
      {status === 'no-record' ? 'Not Checked In' : status.toUpperCase()}
    </span>
  );
}