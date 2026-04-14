import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, User, Briefcase, FileText, DollarSign, LogOut, Menu, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const NavLink = ({ to, icon: Icon, label, testId, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} onClick={onClick}>
      <Button
        variant="ghost"
        className={`rounded-full w-full justify-start ${isActive ? 'bg-violet-100 text-violet-700' : ''}`}
        data-testid={testId}
      >
        <Icon className="w-4 h-4 mr-2" strokeWidth={1.5} />
        {label}
      </Button>
    </Link>
  );
};

const Header = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    window.location.href = '/';
  };

  const close = () => setOpen(false);

  const influencerLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', testId: 'nav-dashboard' },
    { to: '/profile', icon: User, label: 'Profile', testId: 'nav-profile' },
    { to: '/campaigns', icon: Briefcase, label: 'Campaigns', testId: 'nav-campaigns' },
    { to: '/my-applications', icon: FileText, label: 'Applications', testId: 'nav-applications' },
    { to: '/earnings', icon: DollarSign, label: 'Earnings', testId: 'nav-earnings' },
  ];

  const brandLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', testId: 'nav-dashboard' },
    { to: '/my-campaigns', icon: Briefcase, label: 'My Campaigns', testId: 'nav-my-campaigns' },
    { to: '/influencers', icon: Users, label: 'Discover', testId: 'nav-discover' },
    { to: '/payouts', icon: DollarSign, label: 'Payouts', testId: 'nav-payouts' },
  ];

  const links = user?.role === 'influencer' ? influencerLinks : brandLinks;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-950 to-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">F</span>
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Fluence House</span>
          </Link>

          {user ? (
            <>
              {/* Desktop nav */}
              <nav className="hidden md:flex items-center space-x-1">
                {links.map(l => (
                  <NavLink key={l.to} {...l} />
                ))}
                <Button
                  variant="ghost"
                  className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Logout
                </Button>
              </nav>

              {/* Mobile hamburger */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden rounded-full" data-testid="mobile-menu-btn">
                    <Menu className="w-5 h-5" strokeWidth={1.5} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-950 to-violet-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>
                  <nav className="p-4 space-y-1">
                    {links.map(l => (
                      <NavLink key={l.to} {...l} onClick={close} />
                    ))}
                    <div className="pt-4 mt-4 border-t border-slate-200">
                      <Button
                        variant="ghost"
                        className="rounded-full w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                        data-testid="mobile-logout-button"
                      >
                        <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Logout
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="rounded-full text-sm" data-testid="login-link">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full px-4 sm:px-6 text-sm" data-testid="register-link">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;