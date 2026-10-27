import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShieldCheck, Heart, User, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import Badge from './Badge.jsx';

export const Navbar = ({ user, logout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-warm-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-md bg-forest flex items-center justify-center text-white shadow-xs">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-charcoal tracking-tight leading-none">
                  Estate<span className="text-forest">Square</span>
                </span>
                <span className="text-[10px] text-charcoal-muted uppercase tracking-widest mt-0.5 font-medium">
                  Verified India
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex ml-8 space-x-6 text-sm font-medium">
              <Link
                to="/search?listingType=sale"
                className={`transition-colors py-1 ${
                  isActive('/search') && location.search.includes('sale')
                    ? 'text-forest font-semibold border-b-2 border-forest'
                    : 'text-charcoal hover:text-forest'
                }`}
              >
                Buy
              </Link>
              <Link
                to="/search?listingType=rent"
                className={`transition-colors py-1 ${
                  isActive('/search') && location.search.includes('rent')
                    ? 'text-forest font-semibold border-b-2 border-forest'
                    : 'text-charcoal hover:text-forest'
                }`}
              >
                Rent
              </Link>
              <Link
                to="/search"
                className={`transition-colors py-1 ${
                  isActive('/search') && !location.search
                    ? 'text-forest font-semibold border-b-2 border-forest'
                    : 'text-charcoal hover:text-forest'
                }`}
              >
                Explore All
              </Link>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'seller' && (
                  <Link
                    to="/property/new"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-forest border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Property</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin/moderation"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Moderation</span>
                  </Link>
                )}

                {user.role === 'buyer' && (
                  <Link
                    to="/dashboard/buyer"
                    className="text-charcoal hover:text-forest transition-colors p-1.5 rounded-md hover:bg-warm-100"
                    title="Favorites & Visits"
                  >
                    <Heart className="w-5 h-5 text-charcoal-muted hover:text-forest" />
                  </Link>
                )}

                {/* Dashboard Link based on role */}
                <Link
                  to={user.role === 'seller' ? '/dashboard/seller' : user.role === 'admin' ? '/admin/moderation' : '/dashboard/buyer'}
                  className="flex items-center space-x-2 text-sm text-charcoal hover:text-forest transition-colors px-2 py-1 rounded-md hover:bg-warm-100"
                >
                  <User className="w-4 h-4 text-charcoal-muted" />
                  <span className="font-medium max-w-[120px] truncate">{user.name}</span>
                  <Badge variant={user.role} size="sm">{user.role}</Badge>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md text-charcoal-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-charcoal hover:text-forest transition-colors px-3 py-1.5"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-forest hover:bg-forest-hover rounded-md shadow-xs transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-charcoal hover:bg-warm-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <Link
            to="/search?listingType=sale"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-charcoal hover:bg-warm-100"
          >
            Buy Properties
          </Link>
          <Link
            to="/search?listingType=rent"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-charcoal hover:bg-warm-100"
          >
            Rent Properties
          </Link>
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-charcoal hover:bg-warm-100"
          >
            Explore All
          </Link>

          <div className="pt-3 border-t border-warm-200">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-charcoal">{user.name}</span>
                  <Badge variant={user.role}>{user.role}</Badge>
                </div>
                {user.role === 'seller' && (
                  <>
                    <Link
                      to="/property/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-forest bg-emerald-50"
                    >
                      + Post New Property
                    </Link>
                    <Link
                      to="/dashboard/seller"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-charcoal hover:bg-warm-100"
                    >
                      Seller Dashboard
                    </Link>
                  </>
                )}
                {user.role === 'buyer' && (
                  <Link
                    to="/dashboard/buyer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-charcoal hover:bg-warm-100"
                  >
                    Buyer Dashboard (Visits & Favorites)
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/moderation"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-amber-900 bg-amber-50"
                  >
                    Admin Moderation Portal
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-charcoal border border-warm-300 rounded-md hover:bg-warm-100"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-forest hover:bg-forest-hover rounded-md shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
