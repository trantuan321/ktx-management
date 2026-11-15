import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Buildings from './pages/Buildings.jsx';
import Rooms from './pages/Rooms.jsx';
import Students from './pages/Students.jsx';
import Applications from './pages/Applications.jsx';
import AvailableRooms from './pages/AvailableRooms.jsx';
import Profile from './pages/Profile.jsx';
import Users from './pages/Users.jsx';

function RequireRole({ roles, children }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route
            path="phong-trong"
            element={
              <RequireRole roles={['student']}>
                <AvailableRooms />
              </RequireRole>
            }
          />
          <Route path="don-dang-ky" element={<Applications />} />
          <Route
            path="ho-so"
            element={
              <RequireRole roles={['student']}>
                <Profile />
              </RequireRole>
            }
          />

          <Route
            path="toa-nha"
            element={
              <RequireRole roles={['manager', 'admin']}>
                <Buildings />
              </RequireRole>
            }
          />
          <Route
            path="phong"
            element={
              <RequireRole roles={['manager', 'admin']}>
                <Rooms />
              </RequireRole>
            }
          />
          <Route
            path="sinh-vien"
            element={
              <RequireRole roles={['manager', 'admin']}>
                <Students />
              </RequireRole>
            }
          />
          <Route
            path="nguoi-dung"
            element={
              <RequireRole roles={['admin']}>
                <Users />
              </RequireRole>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
