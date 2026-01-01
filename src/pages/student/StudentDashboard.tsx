import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { useSecretaryDashboard } from "../../hooks/useSecretaryDashboard";
import { UsersTable } from "../../components/admin/UsersTable"; 

export default function StudentDashboard() {
  const navigate = useNavigate();
  // 👇 Use our updated hook
  const { myMembers, loading, refreshMembers, stats, chartData, handleDelete } = useSecretaryDashboard();
  
  const COLORS = ["#8884d8", "#82ca9d"]; // Purple for Senior, Green for Junior

  if (loading) return <div className="p-8 text-gray-500">Loading Local Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Local Command Center</h1>
          <p className="text-gray-500">Managing {stats.total} local members</p>
        </div>
        <button 
          onClick={refreshMembers} 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* --- TOP SECTION: CHARTS & STATS --- */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* CHART: Senior vs Junior Composition */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Member Composition</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={chartData} 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center space-y-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wide font-semibold">Total Managed</p>
            <p className="text-5xl font-extrabold text-blue-600">{stats.total}</p>
          </div>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-gray-500 text-xs uppercase">Seniors (25+)</p>
              <p className="text-xl font-bold text-purple-600">{stats.senior}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Juniors (&lt;25)</p>
              <p className="text-xl font-bold text-green-600">{stats.junior}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: MEMBER LIST (With Duty!) --- */}
      <UsersTable 
        users={myMembers} 
        onEdit={(id) => navigate(`/admin/edit-member/${id}`)} // Reusing the same edit page is smart!
        onDelete={handleDelete}
      />

    </div>
  );
}