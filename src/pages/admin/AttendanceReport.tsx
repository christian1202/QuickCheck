import { useAttendanceReport } from "../../hooks/useAttendanceReport";
import { AttendanceHeader } from "../../components/admin/attendance/AttendanceHeader";
import { EventSelector } from "../../components/admin/attendance/EventSelector";
import { AttendanceTable } from "../../components/admin/attendance/AttendanceTable";


export default function AttendanceReport() {
  const { 
    users,loading, scope, selectedDate, hasMore,
    setSelectedDate, navigateDate, loadMoreUsers,
    availableEvents, selectedEvent, setSelectedEvent, attendanceMap, handleMarkAttendance,
  } = useAttendanceReport();

  if (loading) return <div className="p-8 text-gray-500">Loading System...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. HEADER */}
      <AttendanceHeader 
        scope={scope} 
        userCount={users.length} 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate}
        onNavigate={navigateDate}
      />

      {/* 2. EVENT SELECTOR */}
      <EventSelector 
        date={selectedDate}
        availableEvents={availableEvents}
        selectedEvent={selectedEvent}
        onSelect={setSelectedEvent}
      />

      {/* 3. TABLE (Passes the ID to solve the 2-event problem) */}
      <AttendanceTable 
        users={users}
        attendanceMap={attendanceMap}
        selectedEventId={selectedEvent?.id} // 👈 Critical: Table uses this to filter
        onUpdateStatus={handleMarkAttendance}
        hasMore={scope === 'global' && hasMore}
        onLoadMore={loadMoreUsers}
      />

    </div>
  );
}