import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './redux/authStore';
import { FiLoader } from 'react-icons/fi';
import './App.css';
import AuthPage from './pages/auth-page/AuthPage';
import { Layout } from './components/Layout';
import BooksPage from './pages/book-page/BookPage';
import InventoryPage from './pages/inventory-page/InventoryPage';
import OrderPage from './pages/order-page/OrderPage';
import CategoriesPage from './pages/category-page/CategoryPage';
import AuthorPage from './pages/author-page/AuthorPage';
import GenresPage from './pages/genre-page/GenrePage';
import PermissionsPage from './pages/permission-page/PermissionPage';
import RolesPage from './pages/role-page/RolesPage';
import VendorsPage from './pages/vendor-page/VendorPage';
import DashboardPage from './pages/dashboard-page/DashboardPage';

interface ProtectedRouteProps {
  allowedRoles?: Array<"customer" | "vendor" | "admin">;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { accessToken, user } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  const { user, accessToken, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-muted">
        <FiLoader className="text-3xl animate-spin text-primary mb-3" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={accessToken ? <Navigate to="/" replace /> : <AuthPage />} 
      />

      <Route element={<ProtectedRoute allowedRoles={["admin", "vendor"]} />}>
        <Route element={<Layout type={user?.role === "admin" ? "admin" : "vendor"} />}>
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path ="/dashboard" element={<DashboardPage/>}/>
          <Route path="/books" element={<BooksPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrderPage />} />

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/vendors" element={<VendorsPage/>} />
            <Route path="/permissions" element={<PermissionsPage/>} />
            <Route path="/roles" element={<RolesPage/>} />
          </Route>

          <Route path="/request/category" element={<CategoriesPage />} />
          <Route path="/request/genre" element={<GenresPage />} />
          <Route path="/request/authors" element={<AuthorPage />} />

          <Route path="*" element={<div className="p-6 text-danger font-bold text-sm bg-card-bg border border-slate-200 rounded-xl m-6">404 - Requested System Workstation Resource Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;