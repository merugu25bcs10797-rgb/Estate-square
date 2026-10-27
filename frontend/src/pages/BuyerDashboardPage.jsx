import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import visitService from '../services/visitService.js';
import enquiryService from '../services/enquiryService.js';
import favoriteService from '../services/favoriteService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatISTDateTime, formatPrice } from '../utils/formatters.js';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { Calendar, MessageSquare, Heart, Clock, Search, MapPin, XCircle } from 'lucide-react';

export const BuyerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('visits'); // 'visits' | 'enquiries' | 'favorites'
  const [visits, setVisits] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vRes, eRes, fRes] = await Promise.all([
        visitService.getMyVisits(),
        enquiryService.getMyEnquiries(),
        favoriteService.getMyFavorites()
      ]);
      setVisits(vRes.data.visits || []);
      setEnquiries(eRes.data.enquiries || []);
      setFavorites(fRes.data.favorites || []);
    } catch (err) {
      toast.error('Could not load some dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cancel visit handler
  const handleCancelVisit = async (visitId) => {
    try {
      await visitService.updateVisitStatus(visitId, 'cancelled');
      toast.success('Visit cancelled successfully.');
      setVisits((prev) =>
        prev.map((v) => (v._id === visitId ? { ...v, status: 'cancelled' } : v))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel visit.');
    }
  };

  // Remove favorite handler
  const handleToggleFavorite = async (propertyId) => {
    try {
      await favoriteService.toggleFavorite(propertyId);
      toast.success('Removed from favorites.');
      setFavorites((prev) => prev.filter((f) => (f.property?._id || f.property) !== propertyId));
    } catch (err) {
      toast.error('Failed to update favorites.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-warm-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Buyer & Tenant Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">
            Buyer Dashboard
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Track your scheduled visits, owner enquiries, and saved favorite properties
          </p>
        </div>

        <Link to="/search">
          <Button variant="secondary" size="md">
            <Search className="w-4 h-4 mr-1.5" />
            Explore More Properties
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-warm-200 mt-6">
        <button
          onClick={() => setActiveTab('visits')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'visits'
              ? 'border-forest text-forest'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Visits ({visits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'enquiries'
              ? 'border-forest text-forest'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Enquiries ({enquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'favorites'
              ? 'border-forest text-forest'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Favorites ({favorites.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-charcoal-muted">
            Loading your dashboard...
          </div>
        ) : activeTab === 'visits' ? (
          /* Visits Tab */
          visits.length === 0 ? (
            <div className="text-center py-20 bg-white border border-warm-200 rounded-lg p-8">
              <Calendar className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal">No visits requested yet</h3>
              <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
                Explore verified listings and schedule a convenient 1-hour visit slot.
              </p>
              <div className="mt-5">
                <Link to="/search">
                  <Button variant="primary" size="sm">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((v) => (
                <div
                  key={v._id}
                  className="bg-white border border-warm-200 rounded-lg p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-xs"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={
                        v.property?.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={v.property?.title}
                      className="w-20 h-16 rounded object-cover flex-shrink-0 bg-warm-200 border border-warm-200"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Link
                          to={`/property/${v.property?._id}`}
                          className="text-sm font-bold text-charcoal hover:text-forest transition-colors"
                        >
                          {v.property?.title || 'Property'}
                        </Link>
                        <Badge variant={v.status}>{v.status}</Badge>
                      </div>

                      <div className="flex items-center text-xs text-forest font-semibold space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Visit Slot: {formatISTDateTime(v.visitDate)} (IST)</span>
                      </div>

                      <p className="text-xs text-charcoal-muted mt-1">
                        Owner Contact: <strong className="text-charcoal">{v.seller?.name}</strong> &bull; {v.seller?.email} {v.seller?.phone ? `(${v.seller.phone})` : ''}
                      </p>

                      {v.sellerNote && (
                        <p className="text-[11px] text-charcoal-muted italic mt-1">
                          Owner note: "{v.sellerNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end md:self-center">
                    {(v.status === 'pending' || v.status === 'confirmed') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancelVisit(v._id)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Cancel Visit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'enquiries' ? (
          /* Enquiries Tab */
          enquiries.length === 0 ? (
            <div className="text-center py-20 bg-white border border-warm-200 rounded-lg p-8">
              <MessageSquare className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal">No enquiries sent yet</h3>
              <p className="text-xs text-charcoal-muted mt-1">
                Reach out to owners directly from any property details page.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((e) => (
                <div
                  key={e._id}
                  className="bg-white border border-warm-200 rounded-lg p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      to={`/property/${e.property?._id}`}
                      className="text-sm font-bold text-charcoal hover:text-forest"
                    >
                      {e.property?.title}
                    </Link>
                    <Badge variant={e.status}>{e.status}</Badge>
                  </div>

                  <p className="text-xs text-charcoal bg-warm-50 p-2.5 rounded border border-warm-200 mt-2">
                    "{e.message}"
                  </p>

                  <div className="text-[11px] text-charcoal-muted mt-2">
                    Sent to Owner: <strong className="text-charcoal">{e.seller?.name}</strong> ({e.seller?.email})
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Favorites Tab */
          favorites.length === 0 ? (
            <div className="text-center py-20 bg-white border border-warm-200 rounded-lg p-8">
              <Heart className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal">No saved properties</h3>
              <p className="text-xs text-charcoal-muted mt-1">
                Click the heart icon on any listing to save it to your dashboard.
              </p>
              <div className="mt-5">
                <Link to="/search">
                  <Button variant="primary" size="sm">
                    Find Properties
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((f) => (
                <PropertyCard
                  key={f._id}
                  property={f.property}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BuyerDashboardPage;
