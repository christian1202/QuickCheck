import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout"; 
import Login from "./pages/auth/Login";
import Dashboard from "./pages/student/Dashboard";
import CreateEvent from "./pages/admin/CreateEvent";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddMember from "./pages/admin/AddMember";
import EditMember from "./pages/admin/EditMember";
import MyHistory from "./pages/student/MyHistory";
import AttendanceReport from "./pages/admin/AttendanceReport";
import ManageEvents from "./pages/admin/ManageEvents";
import EditEvent from "./pages/admin/EditEvent"; 


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* 🔒 START: Protected Area (Requires Login) */}
      <Route element={<ProtectedRoute />}>
        
        {/* 🎨 START: Layout (Adds the Sidebar to everything inside) */}
        <Route element={<DashboardLayout />}>
           
           {/* Student Pages */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<MyHistory />} />

           {/* Admin Pages */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create-event" element={<CreateEvent />} />
          <Route path="/admin/add-member" element={<AddMember />} />
          <Route path="/admin/attendance-report" element={<AttendanceReport />} />
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/admin/edit-event/:id" element={<EditEvent />} />
           
           {/* 👇 HERE IT IS! The new dynamic route */}
           <Route path="/admin/edit-member/:id" element={<EditMember />} />

        </Route>
        {/* 🎨 END: Layout */}

      </Route>
      {/* 🔒 END: Protected Area */}

      {/* Catch-all: Send unknown pages to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;