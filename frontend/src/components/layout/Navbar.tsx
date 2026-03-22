import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, ShoppingCart, Sun, Moon, Search, User, X, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Custom Print', path: '/custom-print' },
  { name: 'About', path: '/about' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoUrl = 'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/logo/printforge%20logo.png';
  const [showLogoImage, setShowLogoImage] = useState(Boolean(logoUrl));
  const location = useLocation();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const fullName = user?.name || '';
  const initials =
    fullName.trim()?.split(/\s+/).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join('') ||
    user?.email?.slice(0, 2).toUpperCase() ||
    'U';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-strong shadow-soft'
            : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              {showLogoImage ? (
                <img
                  src={logoUrl}
                  alt="PrintForge Logo"
                  className="w-12 h-12 object-contain"
                  onError={() => setShowLogoImage(false)}
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-secondary text-foreground flex items-center justify-center font-semibold text-sm">
                  PF
                </div>
              )}
              <span className="font-display text-xl font-medium text-foreground">
                Print<span className="text-accent">Forge</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-medium text-sm tracking-wide transition-colors hover:text-foreground ${
                    location.pathname === link.path
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
                onClick={toggleTheme}
              >
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="w-5 h-5" />
              </Button>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Auth */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-secondary text-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Account
                    </DropdownMenuLabel>
                    <div className="px-2 pb-2 text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />

                    {/* Profile Link */}
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </DropdownMenuItem>
                    </Link>

                    {/* Saved Addresses Link */}
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <MapPin className="h-4 w-4 mr-2" />
                        Saved Addresses
                      </DropdownMenuItem>
                    </Link>

                    {/* Orders Link */}
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        My Orders
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await signOut();
                        } catch (err) {
                          console.error('Logout error:', err);
                          // force reload or navigate if error happens to clear stale state
                          window.location.href = '/';
                        }
                      }}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login" state={{ from: location.pathname }}>
                  <Button variant="outline" size="sm" className="ml-1">
                    Sign in
                  </Button>
                </Link>
              )}

              <Link to="/custom-print">
                <Button size="sm" className="ml-2">
                  Upload Design
                </Button>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground"
                onClick={toggleTheme}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </Button>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden pt-20"
          >
            <div className="absolute inset-0 bg-background/98 backdrop-blur-xl" />
            <nav className="relative container mx-auto px-4 py-8">
              <div className="flex flex-col gap-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      className={`text-2xl font-display font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  className="pt-4"
                >
                  <Link to="/custom-print">
                    <Button size="lg" className="w-full">
                      Upload Your Design
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.1 }}
                >
                  {user ? (
                    <div className="space-y-2">
                      <Link to="/profile" className="block">
                        <Button variant="outline" size="lg" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          My Profile
                        </Button>
                      </Link>
                      <Link to="/profile" className="block">
                        <Button variant="outline" size="lg" className="w-full justify-start">
                          <MapPin className="h-4 w-4 mr-2" />
                          Saved Addresses
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start"
                        onClick={() => signOut()}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Link to="/login" state={{ from: location.pathname }}>
                      <Button variant="outline" size="lg" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}