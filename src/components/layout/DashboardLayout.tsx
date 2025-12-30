import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Ensure you have this hook
import { LogOut, LayoutDashboard, CalendarPlus, UserPlus, Users } from "lucide-react"; // Icons

export default function DashboardLayout() {
  const { user, logout } = useAuth(); // Get current user
  const navigate = useNavigate();

  // 👇 Check if user is admin (You can also check user.role from database if available)
  // For now, let's assume specific emails are admins, or you can add a generic check.
  const isAdmin = user?.email === "admin@gmail.com"; 

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR START */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">QuickCheck</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          
          {/* 1. SHARED LINKS (Everyone sees this) */}
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
            <LayoutDashboard size={20} />
            <span>My Dashboard</span>
          </Link>

          {/* 2. ADMIN ONLY LINKS */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Tools</p>
              </div>

              <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <Users size={20} />
                <span>Master List</span>
              </Link>

              <Link to="/admin/create-event" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <CalendarPlus size={20} />
                <span>Create Event</span>
              </Link>

              <Link to="/admin/add-member" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <UserPlus size={20} />
                <span>Add Member</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      {/* SIDEBAR END */}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet /> {/* This is where your Dashboard/Admin pages appear */}
        </div>
      </main>
    </div>
  );
}