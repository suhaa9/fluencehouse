import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, LayoutDashboard, User, Briefcase, FileText, DollarSign, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-950 to-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900" style={{fontFamily: 'Outfit, sans-serif'}}>Fluence House</span>
          </Link>

          {user ? (
            <nav className="flex items-center space-x-1">
              <Link to="/dashboard">
                <Button variant="ghost" className="rounded-full" data-testid="nav-dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Dashboard
                </Button>
              </Link>
              
              {user.role === 'influencer' ? (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" className="rounded-full" data-testid="nav-profile">
                      <User className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Profile
                    </Button>
                  </Link>
                  <Link to="/campaigns">
                    <Button variant="ghost" className="rounded-full" data-testid="nav-campaigns">
                      <Briefcase className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Campaigns
                    </Button>
                  </Link>
                  <Link to="/my-applications">
                    <Button variant="ghost" className="rounded-full" data-testid="nav-applications">
                      <FileText className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Applications
                    </Button>
                  </Link>
                  <Link to="/earnings">
                    <Button variant="ghost" className="rounded-full" data-testid="nav-earnings">
                      <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Earnings
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/my-campaigns">
                    <Button variant="ghost" className="rounded-full" data-testid="nav-my-campaigns">
                      <Briefcase className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      My Campaigns
                    </Button>
                  </Link>
                  <Link to="/payouts">
                    <Button variant="ghost" className="rounded-full" data-testid="nav-payouts">
                      <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Payouts
                    </Button>
                  </Link>
                </>
              )}
              
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
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="rounded-full" data-testid="login-link">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-indigo-950 text-white hover:bg-indigo-900 rounded-full px-6" data-testid="register-link">
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