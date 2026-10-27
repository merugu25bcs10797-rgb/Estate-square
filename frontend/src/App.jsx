import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PropertyDetailsPage from './pages/PropertyDetailsPage.jsx';
import AddEditPropertyPage from './pages/AddEditPropertyPage.jsx';
import AdminModerationPage from './pages/AdminModerationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  const { user, logout } = useAuth();

  return (
    <Routes>
      <Route element={<MainLayout user={user} logout={logout} />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/property/:id" element={<PropertyDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Seller Protected Routes */}
        <Route
          path="/property/new"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <AddEditPropertyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/property/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <AddEditPropertyPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminModerationPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
