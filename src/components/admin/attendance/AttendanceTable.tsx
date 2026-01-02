import type { UserProfile,AttendanceRecord } from "../../../types";

interface Props {
  users: UserProfile[];
  selectedEventId: string | undefined;
  onUpdateStatus: (userId: string, status: 'present' | 'late' | 'absent') => void;
  // Optional props for pagination
  onLoadMore?: () => void;
    hasMore?: boolean;
    attendanceMap: Map<string, AttendanceRecord>; // 👈 Receive Map instead of Array
  
}

export function AttendanceTable({ 
  users,  
  selectedEventId, 
  onUpdateStatus, 
  onLoadMore, 
    hasMore,
    attendanceMap,
  
}: Props) {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
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
                // 🚀 INSTANT LOOKUP (O(1))
                // No searching. We just ask: "Do we have a log for 'eventA_john'?"
                const uniqueKey = `${selectedEventId}_${user.uid}`;
                const log = attendanceMap.get(uniqueKey); // 👈 Instant result
                
                const status = log?.status || 'no-record';
                const isDisabled = !selectedEventId;

              return (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.fullName}</td>
                  <td className="px-6 py-4">
                    {/* 👇 StatusBadge is now available because we defined it below */}
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <div className={`flex bg-gray-100 rounded p-1 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {(['present', 'late', 'absent'] as const).map((s) => (
                        <button
                          key={s}
                          disabled={isDisabled}
                          onClick={() => onUpdateStatus(user.uid, s)}
                          className={`px-3 py-1 text-xs font-bold rounded capitalize transition-colors ${
                            status === s
                              ? 'bg-white shadow text-blue-600'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                          title={isDisabled ? "Select an event first" : `Mark as ${s}`}
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
      </div>

      {/* 👇 FIX: Actually use the pagination props */}
      {hasMore && onLoadMore && (
        <div className="p-4 flex justify-center border-t bg-gray-50">
          <button 
            onClick={onLoadMore} 
            className="px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Load Next 50 Members
          </button>
        </div>
      )}
    </div>
  );
}

// 👇 FIX: Defined OUTSIDE the component (Best Practice)
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