import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../lib/firebase";

export default function DashboardLayout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- SIDEBAR (Fixed Left) --- */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">QuickCheck</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* This is where your menu links go */}
          <div className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md font-medium">
            Dashboard
          </div>
          <div className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
             Attendance History
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            {/* User Initials Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm overflow-hidden">
              <p className="font-medium text-gray-900 truncate">{currentUser?.email}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-2 rounded-md transition-colors text-left px-2"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA (Dynamic) --- */}
      <main className="flex-1 overflow-auto p-8">
        {/* <Outlet /> is the magic tag. 
            It renders whatever page we are currently on (Dashboard, History, etc.) 
            inside this layout. */}
        <Outlet />
      </main>
    </div>
  );
}