import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { Home, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await login({ email, password });
      toast.success(`Welcome back, ${res.data.user.name}!`);
      
      // Navigate to destination or role-based default
      if (from !== '/') {
        navigate(from, { replace: true });
      } else {
        if (res.data.user.role === 'admin') navigate('/admin/moderation');
        else if (res.data.user.role === 'seller') navigate('/dashboard/seller');
        else navigate('/dashboard/buyer');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

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

          {/* Quick Demo Login Credentials Bar */}
          <div className="mt-6 pt-5 border-t border-warm-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted text-center mb-2.5">
              Quick Demo Fill
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@propertyhub.com', 'AdminPassword123!')}
                className="py-1.5 px-2 text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 rounded hover:bg-amber-100 transition-colors flex items-center justify-center space-x-1"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('seller@propertyhub.com', 'Seller123!')}
                className="py-1.5 px-2 text-[11px] font-medium bg-emerald-50 text-forest border border-emerald-200 rounded hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-1"
              >
                <UserCheck className="w-3 h-3" />
                <span>Seller</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('buyer@propertyhub.com', 'Buyer123!')}
                className="py-1.5 px-2 text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
              >
                <UserCheck className="w-3 h-3" />
                <span>Buyer</span>
              </button>
            </div>
          </div>

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
