import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login"; // Make sure this file exists
import Dashboard from "./pages/Dashboard"; // Make sure this file exists

function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      {/* Anyone can visit these */}
      <Route path="/login" element={<Login />} />

      {/* --- Protected Routes --- */}
      {/* The ProtectedRoute wraps these. If you aren't logged in, you can't get in. */}
      <Route element={<ProtectedRoute />}>
        {/* If user goes to "/", automatically send them to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* The actual Dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* --- 404 Fallback --- */}
      {/* If they type a random URL, send them back to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;