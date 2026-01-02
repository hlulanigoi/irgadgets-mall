import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  MapPin, 
  User, 
  LogOut, 
  Briefcase,
  Store,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/shops", label: "Shops", icon: Store },
    { href: "/tasks", label: "Tasks", icon: Briefcase },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-primary to-accent flex items-center justify-center text-white shadow-lg group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300">
            <ShoppingBag size={20} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-gray-900">
            eMall<span className="text-primary">.za</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-50 ${
                location.startsWith(item.href) 
                  ? "text-primary bg-primary/5" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                Hi, {user?.firstName || 'User'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-full px-6"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col gap-6 mt-8">
              <Link href="/" onClick={() => setIsOpen(false)} className="text-2xl font-display font-bold">
                Home
              </Link>
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 text-lg font-medium ${
                    location.startsWith(item.href) 
                      ? "text-primary" 
                      : "text-gray-600"
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
              
              <div className="mt-auto border-t pt-6">
                {isAuthenticated ? (
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
