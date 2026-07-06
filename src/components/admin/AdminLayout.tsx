import { Outlet, Link, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { ShieldAlert } from "lucide-react";

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-secondary/10">
      <AdminSidebar activePath={location.pathname} />
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ShieldAlert className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
             <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
               Back to Store
             </Link>
          </div>
        </header>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
