import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; 
import { 
  LogOut, 
  LayoutDashboard, 
  UserPlus, 
  Menu, 
  X,
  History,
  ClipboardList,
  Shield,
  Globe,   // 👈 New Icon for Global
  MapPin   // 👈 New Icon for Local
} from "lucide-react"; 

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- ROLE CHECKS ---
  const isSuperAdmin = user?.email === "admin@gmail.com";
  // Everyone with access to this layout is at least a Manager/Secretary
  const isManager = true; 

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* --- MOBILE HEADER (unchanged) --- */}
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
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
          
          {/* 1. PERSONAL */}
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Personal</p>
            <Link 
              to="/dashboard" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/history" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            >
              <History size={20} />
              <span>My History</span>
            </Link>
          </div>

          {/* 2. LOCAL MANAGEMENT (For Secretaries & Admins handling local groups) */}
          {isManager && (
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Local Management</p>

              <Link 
                to="/secretary-dashboard" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
              >
                <LayoutDashboard size={20} />
                <span>Local Dashboard</span>
              </Link>

              <Link 
                to="/admin/add-member" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
              >
                <UserPlus size={20} />
                <span>Add Member</span>
              </Link>

              {/* 👇 LOCAL EVENTS */}
              <Link 
                to="/admin/events" 
                state={{ scope: 'local' }} 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
              >
                <MapPin size={20} className="text-purple-500" />
                <span>Local Events</span>
              </Link>

              {/* 👇 LOCAL REPORTS */}
              <Link 
                to="/admin/attendance-report" 
                state={{ scope: 'local' }} 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
              >
                <ClipboardList size={20} className="text-purple-500" />
                <span>Local Reports</span>
              </Link>
            </div>
          )}

          {/* 3. GLOBAL ADMINISTRATION (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Global Admin</p>
              
              <Link 
                to="/admin/dashboard" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <Shield size={20} />
                <span>Master List</span>
              </Link>

              {/* 👇 GLOBAL EVENTS */}
              <Link 
                to="/admin/events" 
                state={{ scope: 'global' }}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <Globe size={20} />
                <span>Global Events</span>
              </Link>

              {/* 👇 GLOBAL REPORTS */}
              <Link 
                to="/admin/attendance-report" 
                state={{ scope: 'global' }}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <Globe size={20} />
                <span>Global Reports</span>
              </Link>
            </div>
          )}
        </nav>

        {/* FOOTER */}
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

      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}