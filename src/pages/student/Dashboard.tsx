import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AdminService } from "../../services/adminService";
import { AttendanceService } from "../../services/attendanceService";
// FIX: Use 'import type'
import type { AppEvent, AttendanceRecord } from "../../types";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [activeEvents, setActiveEvents] = useState<AppEvent[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadDashboard = async () => {
    if (!currentUser) return;
    try {
      const events = await AdminService.getActiveEventsForToday();
      setActiveEvents(events);

      const statusMap: Record<string, AttendanceRecord> = {};
      for (const event of events) {
        const record = await AttendanceService.getTodayRecord(currentUser.uid, event.id);
        if (record) {
          statusMap[event.id] = record;
        }
      }
      setAttendanceStatus(statusMap);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeIn = async (eventId: string) => {
    if (!currentUser) return;
    try {
      await AttendanceService.timeIn(currentUser.uid, eventId);
      await loadDashboard();
    } catch (error) { 
       console.error(error);
       alert("Failed to time in");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading events...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Today's Events</h1>
        <p className="text-gray-600 mt-2">Please mark your attendance for the correct event.</p>
      </div>

      {activeEvents.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500 text-lg">No active events found for today.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {activeEvents.map((event) => {
            const record = attendanceStatus[event.id];
            const isPresent = !!record;

            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className={`h-2 w-full ${event.type === 'service' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                
                <div className="p-6 flex-1">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full mb-3 uppercase tracking-wide">
                    {event.type}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                  <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                    🕒 {event.startTime} - {event.endTime}
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  {isPresent ? (
                    <div className="w-full py-3 bg-green-100 text-green-700 font-medium rounded-lg text-center">
                      ✅ Present
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTimeIn(event.id)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      Time In
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}