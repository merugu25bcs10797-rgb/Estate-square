import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import propertyService from '../services/propertyService.js';
import PropertyCard from '../components/PropertyCard.jsx';
import { PropertyGridSkeleton } from '../components/LoadingSkeleton.jsx';
import Button from '../components/Button.jsx';
import { Search, SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../services/api.js';

const CITIES = ['All', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'];
const PROPERTY_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Villa', value: 'villa' },
  { label: 'Independent House', value: 'independent_house' },
  { label: 'Plot', value: 'plot' },
  { label: 'Commercial', value: 'commercial' }
];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  // Derive filters from URL searchParams
  const city = searchParams.get('city') || '';
  const listingType = searchParams.get('listingType') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Update query params helper
  const updateFilter = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
    });
    // Reset to page 1 whenever any filter besides page changes
    if (!('page' in newParams)) {
      updated.set('page', '1');
    }
    setSearchParams(updated);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Fetch properties from server
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const params = {};
      if (city && city !== 'All') params.city = city;
      if (listingType) params.listingType = listingType;
      if (propertyType) params.propertyType = propertyType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (bedrooms) params.bedrooms = bedrooms;
      if (sort) params.sort = sort;
      params.page = page;
      params.limit = 9;

      const res = await propertyService.getProperties(params);
      setProperties(res.data.properties || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch properties. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [city, listingType, propertyType, minPrice, maxPrice, bedrooms, sort, page]);

  // Fetch favorites if user is logged in
  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/api/favorites');
      if (res.data?.data?.favorites) {
        const favIds = new Set(res.data.data.favorites.map((f) => f.property?._id || f.property));
        setFavorites(favIds);
      }
    } catch {
      // Graceful fallback if not loaded
    }
  }, [user]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Toggle favorite handler
  const handleToggleFavorite = async (propertyId) => {
    if (!user) {
      toast.info('Please log in as a buyer to save favorite properties.');
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/api/properties/${propertyId}/favorite`);
      const isFav = res.data.data.isFavorite;
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update favorite');
    }
  };

  const hasActiveFilters = Boolean(city || listingType || propertyType || minPrice || maxPrice || bedrooms);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-warm-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">
            Explore Verified Properties
          </h1>
          <p className="text-xs text-charcoal-muted mt-1">
            {isLoading ? 'Searching verified listings...' : `Showing ${total} verified listings across India`}
          </p>
        </div>

        {/* Sort and Clear Actions */}
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 rounded-md hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Clear Filters
            </button>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-charcoal-muted">Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateFilter({ sort: e.target.value })}
              className="text-xs bg-white border border-warm-300 rounded-md px-3 py-1.5 text-charcoal focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-warm-200 rounded-lg p-4 my-6 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* City */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-1">
              City
            </label>
            <select
              value={city || 'All'}
              onChange={(e) => updateFilter({ city: e.target.value === 'All' ? '' : e.target.value })}
              className="w-full text-xs bg-warm-50 border border-warm-200 rounded px-2.5 py-1.5 text-charcoal focus:ring-1 focus:ring-forest"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-1">
              Listing Type
            </label>
            <select
              value={listingType}
              onChange={(e) => updateFilter({ listingType: e.target.value })}
              className="w-full text-xs bg-warm-50 border border-warm-200 rounded px-2.5 py-1.5 text-charcoal focus:ring-1 focus:ring-forest"
            >
              <option value="">Buy & Rent</option>
              <option value="sale">For Sale (Buy)</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-1">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => updateFilter({ propertyType: e.target.value })}
              className="w-full text-xs bg-warm-50 border border-warm-200 rounded px-2.5 py-1.5 text-charcoal focus:ring-1 focus:ring-forest"
            >
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-1">
              Bedrooms (BHK)
            </label>
            <select
              value={bedrooms}
              onChange={(e) => updateFilter({ bedrooms: e.target.value })}
              className="w-full text-xs bg-warm-50 border border-warm-200 rounded px-2.5 py-1.5 text-charcoal focus:ring-1 focus:ring-forest"
            >
              <option value="">Any BHK</option>
              <option value="1">1+ BHK</option>
              <option value="2">2+ BHK</option>
              <option value="3">3+ BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-1">
              Min Price (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={minPrice}
              onChange={(e) => updateFilter({ minPrice: e.target.value })}
              className="w-full text-xs bg-warm-50 border border-warm-200 rounded px-2.5 py-1.5 text-charcoal focus:ring-1 focus:ring-forest"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-1">
              Max Price (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 50000000"
              value={maxPrice}
              onChange={(e) => updateFilter({ maxPrice: e.target.value })}
              className="w-full text-xs bg-warm-50 border border-warm-200 rounded px-2.5 py-1.5 text-charcoal focus:ring-1 focus:ring-forest"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 my-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <PropertyGridSkeleton count={6} />
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-white border border-warm-200 rounded-lg p-8">
          <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-3 text-charcoal-muted">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-charcoal">No approved properties match your criteria</h3>
          <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
            Try loosening your budget filters, changing the selected city, or clearing active filters to view all listings.
          </p>
          <div className="mt-5">
            <Button variant="secondary" size="sm" onClick={handleClearFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                isFavorite={favorites.has(p._id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 pt-6 border-t border-warm-200 flex items-center justify-between">
              <span className="text-xs text-charcoal-muted">
                Page {page} of {totalPages} ({total} total results)
              </span>

              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateFilter({ page: page - 1 })}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => updateFilter({ page: pNum })}
                      className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                        page === pNum
                          ? 'bg-forest text-white'
                          : 'bg-white border border-warm-200 text-charcoal hover:bg-warm-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateFilter({ page: page + 1 })}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
