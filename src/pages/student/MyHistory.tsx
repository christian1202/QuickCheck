import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AttendanceService } from "../../services/attendanceService";
// 👇 FIX 1: Added 'type' keyword here
import type { AttendanceRecord } from "../../types";

export default function MyHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const data = await AttendanceService.getUserHistory(user.uid);
        
        // 👇 FIX 2: Added '|| ""' to handle possible null values safely
        // Also added '[...data]' to create a copy before sorting (Best Practice)
        const sorted = [...data].sort((a, b) => 
          new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
        );
        
        setRecords(sorted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  if (loading) return <div className="p-8">Loading history...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Attendance History</h1>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm uppercase">Total Events Attended</p>
        <p className="text-4xl font-bold text-blue-600">{records.length}</p>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Time In</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{r.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    r.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {/* Handle potentially invalid dates safely */}
                  {r.timeIn ? new Date(r.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}