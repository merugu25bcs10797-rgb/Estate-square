import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import propertyService from '../services/propertyService.js';
import PropertyCard from '../components/PropertyCard.jsx';
import { PropertyGridSkeleton } from '../components/LoadingSkeleton.jsx';
import Button from '../components/Button.jsx';
import { ShieldCheck, Search, Calendar, HeartHandshake, ArrowRight, Building, Sparkles } from 'lucide-react';

const CITIES = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'];

export const HomePage = () => {
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState('');
  const [listingType, setListingType] = useState('sale');
  const [propertyType, setPropertyType] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await propertyService.getProperties({ limit: 6, sort: 'newest' });
        setFeaturedProperties(res.data.properties || []);
      } catch (err) {
        console.warn('Could not load featured properties:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (listingType) params.set('listingType', listingType);
    if (propertyType) params.set('propertyType', propertyType);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white border-b border-warm-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-forest text-xs font-semibold uppercase tracking-wider mb-6 border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Spam &bull; 100% Moderated Listings</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-charcoal tracking-tight max-w-3xl mx-auto leading-tight">
            Curated Indian Real Estate Marketplace
          </h1>

          <p className="mt-4 text-sm sm:text-base text-charcoal-muted max-w-2xl mx-auto">
            Direct owner properties verified before going public. Structured 1-hour visit schedules with conflict prevention and transparent enquiry tracking.
          </p>

          {/* Hero Search Box */}
          <div className="mt-8 max-w-3xl mx-auto bg-warm-50 border border-warm-200 rounded-lg p-3 sm:p-4 shadow-sm">
            {/* Listing Type Switcher */}
            <div className="flex space-x-2 mb-3">
              <button
                type="button"
                onClick={() => setListingType('sale')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  listingType === 'sale'
                    ? 'bg-forest text-white shadow-2xs'
                    : 'bg-white text-charcoal border border-warm-300 hover:bg-warm-100'
                }`}
              >
                Buy Properties
              </button>
              <button
                type="button"
                onClick={() => setListingType('rent')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  listingType === 'rent'
                    ? 'bg-forest text-white shadow-2xs'
                    : 'bg-white text-charcoal border border-warm-300 hover:bg-warm-100'
                }`}
              >
                Rent Properties
              </button>
            </div>

            {/* Inputs & Search Trigger */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-7 gap-2.5">
              <div className="sm:col-span-3 text-left">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-warm-300 rounded-md text-charcoal focus:ring-forest focus:border-forest"
                >
                  <option value="">Select City (All India)</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 text-left">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-warm-300 rounded-md text-charcoal focus:ring-forest focus:border-forest"
                >
                  <option value="">All Property Types</option>
                  <option value="apartment">Apartment / Flat</option>
                  <option value="villa">Luxury Villa</option>
                  <option value="independent_house">Independent House</option>
                  <option value="plot">Residential Plot</option>
                  <option value="commercial">Commercial Space</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <Button type="submit" variant="primary" size="md" className="w-full h-full py-2">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Quick city tag pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-charcoal-muted">
            <span className="font-medium">Popular:</span>
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => navigate(`/search?city=${encodeURIComponent(c)}`)}
                className="px-2 py-0.5 rounded bg-white border border-warm-300 hover:border-forest hover:text-forest transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Approved Listings */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-1.5 text-forest text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Verified & Approved</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-charcoal">
              Featured Verified Listings
            </h2>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center text-xs font-semibold text-forest hover:underline"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <PropertyGridSkeleton count={3} />
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-12 bg-white border border-warm-200 rounded-lg">
            <Building className="w-10 h-10 text-charcoal-muted mx-auto mb-2" />
            <p className="text-xs text-charcoal-muted">No approved properties yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* Value Pillars */}
      <section className="py-12 bg-white border-y border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-warm-50 rounded-lg border border-warm-200">
              <div className="w-10 h-10 rounded-md bg-emerald-100 text-forest flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-charcoal">Strict Admin Moderation</h3>
              <p className="mt-2 text-xs text-charcoal-muted leading-relaxed">
                Zero fake listings or duplicate spam. Every seller listing is manually approved with recorded verification before going public.
              </p>
            </div>

            <div className="p-6 bg-warm-50 rounded-lg border border-warm-200">
              <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-charcoal">Enforced Visit State Machine</h3>
              <p className="mt-2 text-xs text-charcoal-muted leading-relaxed">
                Guaranteed 1-hour conflict-free slots. Strict state transitions prevent double-booking visits on the same property.
              </p>
            </div>

            <div className="p-6 bg-warm-50 rounded-lg border border-warm-200">
              <div className="w-10 h-10 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-charcoal">Direct Owner Enquiries</h3>
              <p className="mt-2 text-xs text-charcoal-muted leading-relaxed">
                Enquire directly with property owners and track response status transparently from your personal dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
