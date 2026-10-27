import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { Home, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, user, isLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Automatically redirect away from login if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      if (from && from !== '/' && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'admin') navigate('/admin/moderation', { replace: true });
        else if (user.role === 'seller') navigate('/dashboard/seller', { replace: true });
        else navigate('/dashboard/buyer', { replace: true });
      }
    }
  }, [user, isLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await login({ email, password });
      toast.success(`Welcome back, ${res.data.user.name}!`);
      
      // Navigate to destination or role-based default with replace: true
      // This prevents the login page from lingering in the browser history
      if (from && from !== '/' && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        if (res.data.user.role === 'admin') navigate('/admin/moderation', { replace: true });
        else if (res.data.user.role === 'seller') navigate('/dashboard/seller', { replace: true });
        else navigate('/dashboard/buyer', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already logged in or checking session, show smooth loading state
  if (isLoading || user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-forest flex items-center justify-center text-white shadow-xs">
            <Home className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-charcoal">
          Sign in to PropertyHub
        </h2>
        <p className="mt-1 text-center text-xs text-charcoal-muted">
          Access your verified properties, visit schedules, and enquiries
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-warm-200 rounded-lg shadow-sm">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-charcoal-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-forest hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
