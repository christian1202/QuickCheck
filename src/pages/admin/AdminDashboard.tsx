import { useEffect, useState } from "react";
import { AdminService } from "../../services/adminService";
// FIX 1: Use 'import type'
import type { UserProfile } from "../../types";
import { calculateAge, getUserCategory } from "../../lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stats, setStats] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#0088FE", "#FF8042"];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const allUsers = await AdminService.getAllUsers();
      setUsers(allUsers);

      // Dummy stats for now
      setStats([
        { name: "Present", value: 15 },
        { name: "Absent", value: 5 },
      ]);
      
    } catch (error) {
      console.error("Error loading admin data", error);
    } finally {
      setLoading(false);
    }
  };

  // FIX 2: Calculate counts here instead of inside the JSX to avoid parser errors
  const seniorCount = users.filter(u => getUserCategory(calculateAge(u.birthdate)) === 'Senior').length;
  const juniorCount = users.filter(u => getUserCategory(calculateAge(u.birthdate)) === 'Junior').length;

  if (loading) return <div className="p-8">Loading Admin Panel...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Command Center</h1>

      {/* --- TOP SECTION: CHARTS --- */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Card 1: Attendance Chart */}
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

        {/* Card 2: Demographics Stats */}
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
              {/* Using &lt; ensures we don't break the parser with a less-than sign */}
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
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            + Add New Member
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Birthdate</th>
                <th className="px-6 py-3 font-medium">Age</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Duty</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {user.status || "Active"} 
                        </span>
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