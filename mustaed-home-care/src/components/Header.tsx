import { useState } from 'react';
import { Menu, X, Phone, User, LogOut, ChevronDown, LayoutDashboard, Package, ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import logo from '@/assets/mustaed-logo.png';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { href: '/#services', label: 'خدماتنا' },
    { href: '/#packages', label: 'الباقات' },
    { href: '/#coverage', label: 'نطاق التغطية' },
    { href: '/#how-it-works', label: 'كيف نعمل' },
    { href: '/#contact', label: 'تواصل معنا' },
  ];

  const handleSubscribeClick = () => {
    if (isAuthenticated) {
      // Logic for authenticated subscribe (e.g., scroll to packages or go to checkout)
      const packagesSection = document.getElementById('packages');
      if (packagesSection) packagesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="مستعد"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary font-medium transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons & User Menu */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Phone number removed as per request */}

            {isAuthenticated && user ? (
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-primary/10">
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">
                        {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount dir="rtl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullname}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/my-subscription')} className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" />
                      <span>اشتراكي</span>
                    </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/request-visit')} className="flex items-center gap-2 cursor-pointer">
                      <Plus className="h-4 w-4" />
                      <span>طلب زيارة</span>
                    </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-visits')} className="flex items-center gap-2 cursor-pointer">
                      <ClipboardList className="h-4 w-4" />
                      <span>زياراتي</span>
                    </DropdownMenuItem>
                  {role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>لوحة التحكم</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="btn-hero-primary text-base py-2 px-6" onClick={() => navigate('/login')}>
                تسجيل الدخول
              </Button>
            )}

          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-card border-b border-border shadow-lg animate-fade-in">
            <nav className="flex flex-col py-4">
              {isAuthenticated && user && (
                <div className="px-6 py-4 flex items-center gap-3 border-b border-border mb-2 bg-muted/20">
                  <Avatar className="h-10 w-10 border border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-right">
                    <p className="text-sm font-medium">{user.fullname}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}

              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-6 py-3 text-foreground/80 hover:text-primary hover:bg-muted/50 font-medium transition-colors text-right"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              <div className="px-6 py-4 border-t border-border mt-2 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Button onClick={() => { navigate('/my-subscription'); setIsMenuOpen(false); }} variant="outline" className="w-full justify-start gap-2">
                        <Package className="h-4 w-4" />
                        اشتراكي
                    </Button>
                    <Button onClick={() => { navigate('/request-visit'); setIsMenuOpen(false); }} variant="outline" className="w-full justify-start gap-2">
                        <Plus className="h-4 w-4" />
                        طلب زيارة
                    </Button>
                    <Button onClick={() => { navigate('/my-visits'); setIsMenuOpen(false); }} variant="outline" className="w-full justify-start gap-2">
                        <ClipboardList className="h-4 w-4" />
                        زياراتي
                    </Button>
                    {role === 'admin' && (
                      <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="w-full justify-start gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        لوحة التحكم
                      </Button>
                    )}
                    <Button onClick={logout} variant="destructive" className="w-full justify-start gap-2">
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => navigate('/login')} className="w-full btn-hero-primary">
                    تسجيل الدخول
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
