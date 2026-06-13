import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import AdminDashboard from "../pages/admin/Dashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageTasks from "../pages/admin/ManageTasks";
import ManageLeaves from "../pages/admin/ManageLeaves";
import ManageAttendance from "../pages/admin/ManageAttendance";
import ManageDepartments from "../pages/admin/ManageDepartments";
import NotificationPanel from "../pages/admin/NotificationPanel";
import CalendarAdmin from "../pages/admin/CalendarAdmin";

import UserDashboard from "../pages/user/Dashboard";
import MyTasks from "../pages/user/MyTasks";
import ViewProfile from "../pages/user/ViewProfile";
import UpdateProfile from "../pages/user/UpdateProfile";
import Attendance from "../pages/user/Attendance";
import Leave from "../pages/user/Leave";
import Notifications from "../pages/user/Notifications";
import Calendar from "../pages/user/Calendar";
import DocumentUpload from "../pages/user/DocumentUpload";

const ProtectedRoute = ({ element, role, user }) => {
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return element;
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to={`/${user.role}`} />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to={`/${user.role}`} />}
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} role="admin" user={user} />} />
        <Route path="/admin/users" element={<ProtectedRoute element={<ManageUsers />} role="admin" user={user} />} />
        <Route path="/admin/departments" element={<ProtectedRoute element={<ManageDepartments />} role="admin" user={user} />} />
        <Route path="/admin/calendar" element={<ProtectedRoute element={<CalendarAdmin />} role="admin" user={user} />} />
        <Route path="/admin/tasks" element={<ProtectedRoute element={<ManageTasks />} role="admin" user={user} />} />
        <Route path="/admin/leaves" element={<ProtectedRoute element={<ManageLeaves />} role="admin" user={user} />} />
        <Route path="/admin/attendance" element={<ProtectedRoute element={<ManageAttendance />} role="admin" user={user} />} />
        <Route path="/admin/notification-panel" element={<ProtectedRoute element={<NotificationPanel />} role="admin" user={user} />} />

        {/* User Routes */}
        <Route path="/user" element={<ProtectedRoute element={<UserDashboard />} role="user" user={user} />} />
        <Route path="/user/tasks" element={<ProtectedRoute element={<MyTasks />} role="user" user={user} />} />
        <Route path="/user/calendar" element={<ProtectedRoute element={<Calendar />} role="user" user={user} />} />
        <Route path="/user/documents" element={<ProtectedRoute element={<DocumentUpload />} role="user" user={user} />} />
        <Route path="/user/profile" element={<ProtectedRoute element={<ViewProfile />} role="user" user={user} />} />
        <Route path="/user/profile/edit" element={<ProtectedRoute element={<UpdateProfile />} role="user" user={user} />} />
        <Route path="/user/attendance" element={<ProtectedRoute element={<Attendance />} role="user" user={user} />} />
        <Route path="/user/leave" element={<ProtectedRoute element={<Leave />} role="user" user={user} />} />
        <Route path="/user/notifications" element={<ProtectedRoute element={<Notifications />} role="user" user={user} />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;