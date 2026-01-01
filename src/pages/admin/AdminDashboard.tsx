import { useEffect, useState } from "react";
import { AdminService } from "../../services/adminService";
import { AttendanceService } from "../../services/attendanceService";
import type { UserProfile } from "../../types";
import { calculateAge, getUserCategory } from "../../lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const COLORS = ["#0088FE", "#FF8042"];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const response = await AdminService.getPaginatedUsers(null); 
      const allUsers = response.users;
      setUsers(allUsers);

      const presentCount = await AttendanceService.getTodayStats();
      const totalMembers = allUsers.length;
      const absentCount = Math.max(0, totalMembers - presentCount);

      setStats([
        { name: "Present", value: presentCount },
        { name: "Absent", value: absentCount },
      ]);
      
    } catch (error) {
      console.error("Error loading admin data", error);
    } finally {
      setLoading(false);
    }
  };

  // 👇 NEW: Delete Function
  const handleDelete = async (userId: string, userName: string) => {
    // 1. Confirm with the user
    const confirmed = window.confirm(`Are you sure you want to delete ${userName}? This cannot be undone.`);
    
    if (confirmed) {
      try {
        // 2. Delete from Firebase
        await AdminService.deleteUser(userId);
        
        // 3. Refresh the list instantly
        await loadAdminData();
        alert("User deleted successfully.");
      } catch (error) {
        console.error(error);
        alert("Failed to delete user.");
      }
    }
  };

  const seniorCount = users.filter(u => getUserCategory(calculateAge(u.birthdate)) === 'Senior').length;
  const juniorCount = users.filter(u => getUserCategory(calculateAge(u.birthdate)) === 'Junior').length;

  if (loading) return <div className="p-8">Loading Admin Panel...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Command Center</h1>

      {/* --- TOP SECTION: CHARTS --- */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Today's Attendance</h2>
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
            <p className="text-gray-500 text-sm uppercase tracking-wide font-semibold">Total Members</p>
            <p className="text-5xl font-extrabold text-blue-600">{users.length}</p>
          </div>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-gray-500 text-xs uppercase">Seniors (25+)</p>
              <p className="text-xl font-bold text-gray-800">{seniorCount}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Juniors (&lt;25)</p>
              <p className="text-xl font-bold text-gray-800">{juniorCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: MEMBER LIST --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">Master List</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Birthdate</th>
                <th className="px-6 py-3 font-medium">Baptism Date</th>
                <th className="px-6 py-3 font-medium">Age</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Duty</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No members found. Add some users to see data.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const age = calculateAge(user.birthdate);
                  const category = getUserCategory(age);
                  
                  return (
                    <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.fullName || user.email}</td>
                      <td className="px-6 py-4 text-gray-600">{user.birthdate || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.baptismDate ? user.baptismDate : <span className="text-gray-400 italic">Not set</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{age !== null ? age : "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          category === 'Senior' ? 'bg-purple-100 text-purple-700' : 
                          category === 'Junior' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.duty || "None"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.status === 'Visitor' ? 'bg-yellow-100 text-yellow-800' : 
                          user.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.status || "Active"}
                        </span>
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        {/* Edit Button */}
                        <button 
                          onClick={() => navigate(`/admin/edit-member/${user.uid}`)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                        >
                          Edit
                        </button>

                        {/* 👇 DELETE BUTTON */}
                        <button 
                          onClick={() => handleDelete(user.uid, user.fullName)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}