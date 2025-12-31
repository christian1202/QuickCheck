import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminService } from "../../services/adminService";
import { Save, ArrowLeft } from "lucide-react";

export default function EditEvent() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  // 👇 FIXED: Initialize with a valid type
  const [type, setType] = useState("service"); 

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;
    try {
      const event = await AdminService.getEventById(id);
      if (event) {
        setTitle(event.title);
        setDate(event.date);
        setStartTime(event.startTime);
        setEndTime(event.endTime);
        // Ensure we handle the type string safely
        setType(event.type); 
      }
    } catch (error) {
      console.error(error); // 👇 FIXED: Log the error
      alert("Error loading event");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await AdminService.updateEvent(id, {
        title,
        date,
        startTime,
        endTime,
        // 👇 FIXED: Cast to the correct types expected by your interface
        type: type as 'service' | 'meeting' | 'special'
      });
      alert("✅ Event Updated Successfully!");
      navigate("/admin/events");
    } catch (error) {
      console.error(error); // 👇 FIXED: Log the error
      alert("Failed to update event");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate("/admin/events")}
        className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Events
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>

        <form onSubmit={handleUpdate} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                required
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="service">Church Service</option>
                <option value="meeting">Meeting</option>
                {/* 👇 FIXED: Changed "event" to "special" to match your TypeScript Interface */}
                <option value="special">Special Event</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                required
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                required
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mt-6"
          >
            <Save size={20} />
            Save Changes
          </button>

        </form>
      </div>
    </div>
  );
}