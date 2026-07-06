import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSidebarProps {
  activePath: string;
}

export function AdminSidebar({ activePath }: AdminSidebarProps) {
  const { signOut } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Products', icon: Package, href: '/admin/products' },
    { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { label: 'Customers', icon: Users, href: '/admin/users' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className="w-64 bg-background border-r flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">PrintForge</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
              activePath === item.href 
                ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
