import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useAttendanceReport } from "../../hooks/useAttendanceReport";

export default function AttendanceReport() {
  const { 
    users, 
    logs, 
    loading, 
    scope, 
    selectedDate, 
    hasMore,
    setSelectedDate, 
    navigateDate, 
    updateStatus, 
    loadMoreUsers,
    // 👇 ADDED: Destructure these missing values from the hook
    availableEvents,
    selectedEvent,
    setSelectedEvent
  } = useAttendanceReport();

  if (loading) return <div className="p-8 text-gray-500">Loading System...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {scope === 'global' ? "🌍 Global Report" : "📍 Local Report"}
          </h1>
          <p className="text-sm text-gray-500">
            {scope === 'global' ? "System-wide records" : `Managing ${users.length} local members`}
          </p>
        </div>

        {/* DATE PICKER */}
        <div className="flex items-center gap-2 bg-white p-1 border rounded-lg shadow-sm">
          <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft size={20}/>
          </button>
          
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-2 py-1 outline-none font-semibold text-gray-700 bg-transparent"
            />
            <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"/>
          </div>

          <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight size={20}/>
          </button>
        </div>
      </div>

      {/* AUTO-DETECT EVENTS SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {availableEvents.length === 0 ? (
          // CASE 1: NO EVENT
          <div className="text-center py-8">
            <div className="text-4xl mb-2">😴</div>
            <h3 className="text-lg font-bold text-gray-700">No Scheduled Events</h3>
            <p className="text-gray-500 text-sm">
              There are no recurring or one-time events scheduled for {selectedDate}.
            </p>
          </div>
        ) : (
          // CASE 2: EVENTS FOUND
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Event for {selectedDate}:
            </label>
            <div className="flex flex-wrap gap-3">
              {availableEvents.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`px-4 py-3 rounded-lg border text-left transition-all ${
                    selectedEvent?.id === ev.id 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-bold">{ev.title}</div>
                  <div className="text-xs opacity-90 mt-1">
                    {ev.batches && ev.batches.length > 0 
                      ? ev.batches.join(", ") 
                      : "Standard Time"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN TABLE */}
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
                   
                   {/* ACTION BUTTONS */}
                   <td className="px-6 py-4 flex justify-end gap-2">
                     <div className="flex bg-gray-100 rounded p-1">
                       {['present', 'late', 'absent'].map((s) => (
                         <button
                           key={s}
                           onClick={() => updateStatus(user.uid, s as 'present' | 'late' | 'absent')}
                           className={`px-3 py-1 text-xs font-bold rounded capitalize transition-colors ${
                             status === s 
                               ? 'bg-white shadow text-blue-600' 
                               : 'text-gray-400 hover:text-gray-600'
                           }`}
                           title={`Mark as ${s}`}
                         >
                           {s[0].toUpperCase()}
                         </button>
                       ))}
                     </div>
                   </td>
                 </tr>
               );
             })}
          </tbody>
        </table>
        
        {/* PAGINATION BUTTON */}
        {scope === 'global' && hasMore && (
          <div className="p-4 flex justify-center border-t bg-gray-50">
            <button 
              onClick={loadMoreUsers} 
              className="px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Load Next 50 Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for Badge Styles
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