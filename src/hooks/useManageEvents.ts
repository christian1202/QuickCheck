import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { AdminService } from "../services/adminService";
import type { AppEvent } from "../types";

export function useManageEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'secretary'>('secretary');

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      // 1. Determine Role
      const isAdmin = user.email === "admin@gmail.com";
      const role = isAdmin ? 'admin' : 'secretary';
      setCurrentUserRole(role);

      // 2. Fetch Only What Is Needed (Server-Side Filtering)
      // 🚀 This is now scalable to 20k+ users because we only fetch relevant rows
      const data = await AdminService.getEventsForRole(role, user.uid);
      
      setEvents(data);

    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string, title: string) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await AdminService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete event");
    }
  };

  const handleCreate = () => {
    // Pass the role so the Create Form knows to default to 'Global' or 'Local'
    navigate("/admin/create-event", { state: { role: currentUserRole } });
  };

  return {
    events,
    loading,
    currentUserRole,
    handleDelete,
    handleCreate,
    navigate
  };
}