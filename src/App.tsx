import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout"; 
import Login from "./pages/auth/Login";
import Dashboard from "./pages/student/Dashboard";
import CreateEvent from "./pages/admin/CreateEvent";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* ...NOW WE USE IT 👇 */}
        <Route element={<DashboardLayout />}>
           <Route path="/" element={<Navigate to="/dashboard" replace />} />
           <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/create-event" element={<CreateEvent />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;