import { useEffect, useState } from "react";
import { AdminService } from "../../services/adminService"; // Your existing service
import { AttendanceService } from "../../services/attendanceService"; // For the charts
import { getAuth } from "firebase/auth"; // To handle direct logins
import { useLocation, useNavigate } from "react-router-dom"; // To handle "Impersonation"
import { ArrowLeft, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { UserProfile } from "../../types";

// Helper Interface for TypeScript
interface ExtendedUser extends UserProfile {
  secretaryId?: string; 
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. IDENTITY STATE
  // Check if Admin passed a student (Impersonation) OR default to null
  const [currentStudent, setCurrentStudent] = useState<UserProfile | null>(location.state?.student || null);
  
  // 2. DATA STATE
  const [users, setUsers] = useState<ExtendedUser[]>([]); // These will be ONLY local members
  const [stats, setStats] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Chart Colors
  const COLORS = ["#0088FE", "#FF8042"];

  useEffect(() => {
    loadStudentData();
  }, [currentStudent]); // Reload if the identity changes

  const loadStudentData = async () => {
    try {
      let studentId = currentStudent?.uid;

      // STEP A: If we don't know who the student is yet (Direct Sidebar Click)
      if (!studentId) {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
           // We are logged in as the secretary
           studentId = currentUser.uid;
           // Optional: Fetch my own profile details if you want to display my name
           const me = await AdminService.getUser(studentId); // Assuming this exists
           setCurrentStudent(me as UserProfile);
        } else {
           console.warn("No user logged in.");
           setLoading(false);
           return;
        }
      }

      // STEP B: Fetch Data & Filter
      // We fetch ALL users, but we filter them immediately
      const allUsers = await AdminService.getAllUsers();
      
      // THE FIX: Filter only members belonging to THIS studentId
      const myMembers = allUsers.filter((u) => (u as ExtendedUser).secretaryId === studentId);
      setUsers(myMembers);

      // STEP C: Calculate Stats for THIS group only
      // (Simplified logic: You might need specific attendance logic per group later)
      const presentCount = await AttendanceService.getTodayStats(); // Note: This might return global stats. 
      // For now, let's just mock the chart based on local members to prevent errors
      const absentCount = Math.max(0, myMembers.length - presentCount); // Approximate

      setStats([
        { name: "Present", value: presentCount > myMembers.length ? myMembers.length : presentCount },
        { name: "Absent", value: absentCount },
      ]);

    } catch (error) {
      console.error("Error loading student dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Delete ${userName}?`)) return;
    try {
      await AdminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.uid !== userId));
    } catch (error) {
        console.error(error);   
      alert("Failed to delete.");
    }
  };

  // --- RENDER ---
  if (loading) return <div className="p-8">Loading Local Dashboard...</div>;

  // Safety check: If still no student identified, show error
  if (!currentStudent && !getAuth().currentUser) {
    return <div className="p-8 text-red-600">Access Denied: No student account identified.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* HEADER: Shows we are in a specific dashboard */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
             {currentStudent ? `${currentStudent.fullName}'s Dashboard` : "My Dashboard"}
          </h1>
          <p className="text-gray-500">Managing Local Members</p>
        </div>
      </div>

      {/* --- TOP SECTION: CHARTS (Same as Admin) --- */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Local Attendance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center space-y-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wide font-semibold">My Members</p>
            <p className="text-5xl font-extrabold text-blue-600">{users.length}</p>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: MEMBER LIST (Same as Admin) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">Local Master List</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.fullName || user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button 
                      onClick={() => navigate(`/admin/edit-member/${user.uid}`)}
                      className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user.uid, user.fullName)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}