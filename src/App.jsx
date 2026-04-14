import { useMemo, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Sales from "./pages/Sales.jsx";
import Inventory from "./pages/Inventory.jsx";
import Quotations from "./pages/Quotations.jsx";

function ProtectedLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  const displayName = useMemo(() => {
    const email = user?.email || "";
    return email ? email.split("@")[0] : "";
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar userEmail={user.email ?? ""} displayName={displayName} onLogout={logout} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/quotations" element={<Quotations />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
