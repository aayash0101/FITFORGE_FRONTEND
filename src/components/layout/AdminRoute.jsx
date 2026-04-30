import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../ui/Loader.jsx';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;