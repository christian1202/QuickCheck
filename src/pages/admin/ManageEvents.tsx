import { useEffect, useState } from "react";
// 👇 1. Add useNavigate for page redirection
import { useNavigate } from "react-router-dom"; 
import { AdminService } from "../../services/adminService";
import type { AppEvent } from "../../types";
// 👇 2. Add 'Edit' to the icon imports
import { Trash2, Calendar, Clock, MapPin, Edit } from "lucide-react";

export default function ManageEvents() {
  // 👇 3. Initialize the navigation hook
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await AdminService.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string, title: string) => {
    if (!window.confirm(`Delete event "${title}"? This will also hide it from students.`)) return;

    try {
      await AdminService.deleteEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
        console.error(error);
      alert("Failed to delete event");
    }
  };

  if (loading) return <div className="p-8">Loading Schedule...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Event Schedule</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            
            {/* Header with Badge & Buttons */}
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                event.type === 'service' ? 'bg-blue-100 text-blue-700' : 
                event.type === 'meeting' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {event.type}
              </div>

              {/* 👇 4. MERGED BUTTONS SECTION */}
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  title="Edit Event"
                >
                  <Edit size={18} />
                </button>

                <button 
                  onClick={() => handleDelete(event.id, event.title)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete Event"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>Main Sanctuary</span> 
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No events found. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}