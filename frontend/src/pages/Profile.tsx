import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { LogOut, MapPin, User, ShoppingBag, Settings } from 'lucide-react';

import SavedAddresses from '@/components/profile/SavedAddresses';

type ProfileTab = 'account' | 'orders' | 'addresses' | 'settings';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user) return null;

  const menuItems = [
    { id: 'account' as ProfileTab, label: 'Account', icon: User },
    { id: 'orders' as ProfileTab, label: 'Orders', icon: ShoppingBag },
    { id: 'addresses' as ProfileTab, label: 'Saved Addresses', icon: MapPin },
    { id: 'settings' as ProfileTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-4xl font-display font-bold text-foreground">
              My Account
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Main Layout: Sidebar + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-4">
                {/* User Info */}
                <div className="pb-4 border-b border-border mb-4">
                  <p className="text-sm text-muted-foreground">Logged in as</p>
                  <p className="font-semibold text-foreground truncate">
                    {user?.name || user?.email || 'User'}
                  </p>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`
                          w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors
                          ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-secondary'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeTab === 'account' && <AccountSection user={user} />}
              {activeTab === 'orders' && <OrdersSection />}
              {activeTab === 'addresses' && <SavedAddresses />}
              {activeTab === 'settings' && <SettingsSection />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Account Section Component
function AccountSection({
  user,
}: {
  user: { id: string; email: string; name?: string } | null;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Account Details</h2>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Name
          </label>
          <p className="text-lg text-foreground mt-1">
            {user?.name || 'Not set'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Email
          </label>
          <p className="text-lg text-foreground mt-1">{user?.email}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            User ID
          </label>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {user?.id}
          </p>
        </div>

        <Button className="w-full">Edit Profile</Button>
      </div>
    </div>
  );
}

// Orders Section Component (Placeholder)
function OrdersSection() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">My Orders</h2>

      <div className="text-center py-12">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No orders yet. Start shopping to see your orders here!
        </p>
      </div>
    </div>
  );
}

// Settings Section Component (Placeholder)
function SettingsSection() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Email Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive email updates about your orders
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Newsletter</p>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for updates and offers
            </p>
          </div>
          <input type="checkbox" className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
