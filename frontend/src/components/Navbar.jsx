import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, Menu, X, LogOut, User, LayoutDashboard, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
    }`;

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/parking', label: 'Parking', icon: Car },
    { to: '/ai-recommendation', label: 'AI Recommend', icon: Sparkles },
    { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
    { to: '/my-bookings', label: 'My Bookings', icon: Car },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/parking', label: 'Manage Parking', icon: Car },
    { to: '/admin/users', label: 'Users', icon: User },
    { to: '/admin/bookings', label: 'Bookings', icon: Car },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 hidden sm:block">Smart Parking</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {user && links.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>{label}</NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center text-sm text-slate-600 hover:text-indigo-600">
                  <User className="w-4 h-4 mr-1.5" />
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {user ? (
            <>
              {links.map(({ to, label }) => (
                <NavLink key={to} to={to} className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  {label}
                </NavLink>
              ))}
              <NavLink to="/profile" className={navLinkClass} onClick={() => setMobileOpen(false)}>Profile</NavLink>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass} onClick={() => setMobileOpen(false)}>Login</NavLink>
              <NavLink to="/register" className={navLinkClass} onClick={() => setMobileOpen(false)}>Register</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
