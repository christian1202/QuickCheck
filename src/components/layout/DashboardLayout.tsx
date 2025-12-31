import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; 
import { 
  LogOut, 
  LayoutDashboard, 
  CalendarPlus, 
  UserPlus, 
  Users, 
  Menu, 
  X,
  History,       // 👈 Added this
  ClipboardList  // 👈 Added this
} from "lucide-react"; 

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === "admin@gmail.com"; 

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-20 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">QuickCheck</h1>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 
        `}
      >
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">QuickCheck</h1>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          
          {/* 1. SHARED LINKS */}
          <Link 
            to="/dashboard" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
          >
            <LayoutDashboard size={20} />
            <span>My Dashboard</span>
          </Link>

          {/* 👇 NEW: Student History Link */}
          <Link 
            to="/history" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
          >
            <History size={20} />
            <span>My History</span>
          </Link>

          {/* 2. ADMIN ONLY LINKS */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Tools</p>
              </div>

              <Link 
                to="/admin/dashboard" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
              >
                <Users size={20} />
                <span>Master List</span>
              </Link>

              {/* 👇 NEW: Attendance Report Link */}
              <Link 
                to="/admin/attendance-report" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
              >
                <ClipboardList size={20} />
                <span>Daily Report</span>
              </Link>

              <Link 
                to="/admin/create-event" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
              >
                <CalendarPlus size={20} />
                <span>Create Event</span>
              </Link>

              <Link 
                to="/admin/add-member" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
              >
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

      {/* --- OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
        />
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}