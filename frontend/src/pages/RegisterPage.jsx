import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { Home, ArrowRight, Building, ShoppingBag, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('buyer'); // strictly buyer or seller
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, user, isLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // If already authenticated, redirect away immediately
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') navigate('/admin/moderation', { replace: true });
      else if (user.role === 'seller') navigate('/dashboard/seller', { replace: true });
      else navigate('/dashboard/buyer', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({
        name,
        email,
        password,
        phone,
        role
      });
      toast.success(`Welcome to PropertyHub, ${res.data.user.name}!`);

      if (role === 'seller') {
        navigate('/dashboard/seller', { replace: true });
      } else {
        navigate('/dashboard/buyer', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-forest flex items-center justify-center text-white shadow-xs">
            <Home className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-charcoal">
          Create your account
        </h2>
        <p className="mt-1 text-center text-xs text-charcoal-muted">
          Join India's verified property platform with moderated listings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-warm-200 rounded-lg shadow-sm">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Role selector tab: Buyer or Seller only */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-2">
              Select Account Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`p-3 rounded-md border text-left transition-all flex flex-col items-start ${
                  role === 'buyer'
                    ? 'border-forest bg-emerald-50/60 ring-1 ring-forest'
                    : 'border-warm-200 bg-white hover:bg-warm-50'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 ${role === 'buyer' ? 'text-forest' : 'text-charcoal-muted'}`} />
                <span className="text-xs font-bold text-charcoal mt-1.5">Buyer / Tenant</span>
                <span className="text-[10px] text-charcoal-muted mt-0.5">Explore & visit properties</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`p-3 rounded-md border text-left transition-all flex flex-col items-start ${
                  role === 'seller'
                    ? 'border-forest bg-emerald-50/60 ring-1 ring-forest'
                    : 'border-warm-200 bg-white hover:bg-warm-50'
                }`}
              >
                <Building className={`w-5 h-5 ${role === 'seller' ? 'text-forest' : 'text-charcoal-muted'}`} />
                <span className="text-xs font-bold text-charcoal mt-1.5">Property Owner</span>
                <span className="text-[10px] text-charcoal-muted mt-0.5">List properties & host visits</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />

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
              label="Password (min. 6 characters)"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Complete Registration
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-charcoal-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-forest hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
