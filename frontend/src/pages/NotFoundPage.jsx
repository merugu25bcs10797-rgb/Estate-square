import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/Button.jsx';

export const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto text-center py-24 px-4">
      <div className="w-16 h-16 bg-warm-200 text-charcoal rounded-full flex items-center justify-center mx-auto mb-6">
        <Home className="w-8 h-8 text-forest" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-charcoal">404 - Page Not Found</h1>
      <p className="mt-3 text-sm text-charcoal-muted leading-relaxed">
        The page or property listing you are searching for might have been moved, unlisted, or does not exist.
      </p>
      <div className="mt-8 flex justify-center space-x-3">
        <Link to="/">
          <Button variant="primary">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <Link to="/search">
          <Button variant="secondary">
            Explore Properties
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
