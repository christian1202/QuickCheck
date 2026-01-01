import { Plus } from "lucide-react";
import { useManageEvents } from "../../hooks/useManageEvents";
import { EventCard } from "../../components/admin/EventCard";

export default function ManageEvents() {
  const { 
    events, 
    loading, 
    currentUserRole, 
    handleDelete, 
    handleCreate, 
    navigate 
  } = useManageEvents();

  if (loading) return <div className="p-8 text-gray-500">Loading Schedule...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* HEADER WITH ADD BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Schedule</h1>
          <p className="text-sm text-gray-500">
            You are viewing as: <span className="font-bold capitalize">{currentUserRole}</span>
          </p>
        </div>

        {/* 👇 THE NEW ADD BUTTON */}
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all active:scale-95"
        >
          <Plus size={18} />
          Create {currentUserRole === 'admin' ? 'Global' : 'Local'} Event
        </button>
      </div>

      {/* EVENTS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500">No events found.</p>
            <button onClick={handleCreate} className="text-blue-600 font-semibold hover:underline mt-2">
              Create your first event
            </button>
          </div>
        ) : (
          events.map((event) => {
            // Logic: Admins can modify Global. Secretaries can only modify their Local events.
            const canModify = currentUserRole === 'admin' 
              ? event.scope === 'global' 
              : event.scope === 'local';

            return (
              <EventCard 
                key={event.id} 
                event={event} 
                canModify={canModify}
                onEdit={(id) => navigate(`/admin/edit-event/${id}`)}
                onDelete={handleDelete}
              />
            );
          })
        )}
      </div>
    </div>
  );
}