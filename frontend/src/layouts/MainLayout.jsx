import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ServerWarmupNotice from '../components/ServerWarmupNotice.jsx';

export const MainLayout = ({ user, logout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50 text-charcoal">
      <ServerWarmupNotice />
      <Navbar user={user} logout={logout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
