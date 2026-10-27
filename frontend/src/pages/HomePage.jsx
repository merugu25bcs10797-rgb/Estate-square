import React from 'react';
import { ShieldCheck, Search, Calendar, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white border-b border-warm-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-forest text-xs font-semibold uppercase tracking-wider mb-6 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Spam &bull; 100% Moderated Listings</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight max-w-3xl mx-auto leading-tight">
            Find Your Next Property in India Without Fake Listings
          </h1>
          <p className="mt-4 text-base sm:text-lg text-charcoal-muted max-w-2xl mx-auto">
            Direct owner listings moderated before public display. Instant visit scheduling with conflict prevention and transparent enquiry tracking.
          </p>

          {/* Quick CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/search">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg border border-warm-200">
            <div className="w-10 h-10 rounded-md bg-emerald-50 text-forest flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-charcoal">Admin Moderated</h3>
            <p className="mt-2 text-xs text-charcoal-muted leading-relaxed">
              Every seller listing is reviewed and approved by moderators before going live. Zero duplicate spam.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-warm-200">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-charcoal">Enforced Visit State Machine</h3>
            <p className="mt-2 text-xs text-charcoal-muted leading-relaxed">
              Book structured visits with guaranteed 1-hour conflict-free slots. Full lifecycle from request to completion.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-warm-200">
            <div className="w-10 h-10 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-charcoal">Direct Owner Enquiries</h3>
            <p className="mt-2 text-xs text-charcoal-muted leading-relaxed">
              Connect directly with verified owners with tracked message statuses and secure responses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
