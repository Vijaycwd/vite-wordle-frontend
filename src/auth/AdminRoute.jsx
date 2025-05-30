// src/auth/AdminRoute.js
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = JSON.parse(localStorage.getItem('auth'));
  const userEmail = token?.email;

  const isAdmin = userEmail === 'cassandra.droogan@pysis.com';

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
