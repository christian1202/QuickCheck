import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { UsersTable } from "../../components/admin/UsersTable";
import { SecretarySelector } from "../../components/admin/SecretarySelector"; // 👈 IMPORT NEW COMPONENT

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const { 
    users, 
    attendanceStats, 
    loading, 
    seniorCount, 
    juniorCount, 
    secretaries,        // 👈 Get from hook
    selectedSecretary,  // 👈 Get from hook
    handleFilterChange, // 👈 Get from hook
    handleDelete 
  } = useAdminDashboard();

  const COLORS = ["#0088FE", "#FF8042"];

  if (loading) return <div className="p-8 text-gray-500">Loading System...</div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* HEADER ROW: Title + Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Command Center</h1>
        
        {/* 👇 THE NEW FILTER COMPONENT */}
        <SecretarySelector 
          secretaries={secretaries} 
          selectedId={selectedSecretary} 
          onSelect={handleFilterChange} 
        />
      </div>

      {/* --- TOP SECTION: CHARTS --- */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ... (Pie Chart code stays exactly the same) ... */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Dashboard</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                  {attendanceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ... (Stats Cards code stays exactly the same) ... */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center space-y-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wide font-semibold">
              {selectedSecretary ? "Secretary's Members" : "Total Members"}
            </p>
            <p className="text-5xl font-extrabold text-blue-600">{users.length}</p>
          </div>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-gray-500 text-xs uppercase">Seniors</p>
              <p className="text-xl font-bold text-gray-800">{seniorCount}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Juniors</p>
              <p className="text-xl font-bold text-gray-800">{juniorCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: TABLE --- */}
      {/* The table automatically shows whatever 'users' are in state (Global or Filtered) */}
      <UsersTable 
        users={users} 
        onEdit={(id) => navigate(`/admin/edit-member/${id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}