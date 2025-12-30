import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout"; 
import Login from "./pages/auth/Login";           
import Dashboard from "./pages/student/Dashboard"; 

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Area */}
      <Route element={<ProtectedRoute />}>
        
        {/* Layout Wrapper (This fixes the 'unused import' error) */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;