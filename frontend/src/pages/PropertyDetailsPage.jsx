import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import propertyService from '../services/propertyService.js';
import { formatPrice } from '../utils/formatters.js';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../services/api.js';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Heart,
  Calendar,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  User,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [property, setProperty] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Enquiry modal & state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: 'Hello, I am interested in this property. Please share more details.'
  });
  const [isEnquirySubmitting, setIsEnquirySubmitting] = useState(false);

  // Visit modal & state
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00');
  const [visitNote, setVisitNote] = useState('');
  const [isVisitSubmitting, setIsVisitSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await propertyService.getPropertyById(id);
        setProperty(res.data.property);

        // Check favorite status if logged in
        if (user) {
          try {
            const favRes = await api.get('/api/favorites');
            const exists = favRes.data?.data?.favorites?.some(
              (f) => (f.property?._id || f.property) === id
            );
            setIsFavorite(Boolean(exists));
          } catch {
            // Non-critical
          }
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Property not found or moderation review required.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.info('Please sign in as a buyer to save favorite properties.');
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      toast.error('Administrators and Sellers cannot favorite properties.');
      return;
    }
    try {
      const res = await api.post(`/api/properties/${id}/favorite`);
      setIsFavorite(res.data.data.isFavorite);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update favorite');
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to send an enquiry.');
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      toast.error('Administrators and Sellers cannot submit buyer enquiries.');
      return;
    }
    setIsEnquirySubmitting(true);
    try {
      await api.post(`/api/properties/${id}/enquiries`, enquiryForm);
      toast.success('Your enquiry has been sent to the property owner!');
      setEnquiryModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit enquiry.');
    } finally {
      setIsEnquirySubmitting(false);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to request a visit.');
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      toast.error('Administrators and Sellers cannot schedule property visits.');
      return;
    }
    if (!visitDate || !visitTime) {
      toast.error('Please pick a valid date and time slot.');
      return;
    }

    // Combine local date & time into ISO UTC string
    const combinedDate = new Date(`${visitDate}T${visitTime}:00`);
    if (isNaN(combinedDate.getTime())) {
      toast.error('Invalid date format');
      return;
    }

    if (combinedDate <= new Date()) {
      toast.error('Visit date must be set in the future.');
      return;
    }

    setIsVisitSubmitting(true);
    try {
      await api.post(`/api/properties/${id}/visits`, {
        visitDate: combinedDate.toISOString(),
        note: visitNote
      });
      toast.success('Visit request submitted! Awaiting owner confirmation.');
      setVisitModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule visit.');
    } finally {
      setIsVisitSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 bg-warm-200 rounded w-1/3 mb-4 animate-pulse" />
        <div className="aspect-16/9 bg-warm-200 rounded-lg w-full mb-8 animate-pulse" />
      </div>
    );
  }

  if (errorMsg || !property) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-charcoal">Property Not Available</h2>
        <p className="text-xs text-charcoal-muted mt-2">{errorMsg || 'Listing not found.'}</p>
        <Link to="/search" className="mt-6 inline-block">
          <Button variant="primary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [
    { url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80' }
  ];

  const isOwner = user && user._id === property.owner?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button and status bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-charcoal"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Listings
        </button>

        <div className="flex items-center space-x-2">
          <Badge variant={property.listingType}>For {property.listingType}</Badge>
          <Badge variant={property.status}>{property.status}</Badge>
        </div>
      </div>

      {/* Moderation Rejection Notice for Owner */}
      {property.status === 'rejected' && isOwner && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start justify-between">
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1">
              Moderation Rejection Notice
            </span>
            <p>{property.rejectionReason || 'Documentation or photograph resolution did not meet criteria.'}</p>
          </div>
          <Link to={`/property/${property._id}/edit`}>
            <Button variant="danger" size="sm">
              Edit & Resubmit
            </Button>
          </Link>
        </div>
      )}

      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 aspect-4/3 sm:aspect-16/10 rounded-lg overflow-hidden bg-warm-200 relative">
          <img
            src={images[activeImageIndex]?.url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`relative aspect-4/3 lg:aspect-auto lg:h-28 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 w-28 lg:w-full ${
                activeImageIndex === idx ? 'border-forest ring-1 ring-forest' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Details + Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-charcoal">
                {formatPrice(property.price, property.listingType)}
              </span>
              {(!user || user.role === 'buyer') && (
                <button
                  onClick={handleToggleFavorite}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-warm-300 text-xs font-semibold text-charcoal hover:bg-warm-100 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : 'text-charcoal-muted'}`} />
                  <span>{isFavorite ? 'Saved to Favorites' : 'Save Property'}</span>
                </button>
              )}
            </div>
            <h1 className="text-xl font-bold text-charcoal mt-2">{property.title}</h1>
            <div className="flex items-center text-xs text-charcoal-muted mt-1.5 space-x-1">
              <MapPin className="w-4 h-4 text-forest flex-shrink-0" />
              <span>{property.address}, {property.city}</span>
            </div>
          </div>

          {/* Quick Specifications Pill Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-white border border-warm-200 rounded-lg">
            <div className="text-center">
              <span className="text-xs text-charcoal-muted block">Bedrooms</span>
              <span className="text-base font-bold text-charcoal mt-0.5">{property.bedrooms} BHK</span>
            </div>
            <div className="text-center border-x border-warm-200">
              <span className="text-xs text-charcoal-muted block">Bathrooms</span>
              <span className="text-base font-bold text-charcoal mt-0.5">{property.bathrooms} Bath</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-charcoal-muted block">Super Area</span>
              <span className="text-base font-bold text-charcoal mt-0.5">{property.areaSqFt} sq.ft</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-warm-200 rounded-lg p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal mb-3">
              Property Description
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Moderation Guarantee Note */}
          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-forest">Verified & Moderated Listing</span>
              <p className="text-charcoal-muted mt-0.5">
                This listing underwent administrative review for verified address integrity and legitimate ownership before publication.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 col: Contact & Actions Sidebar */}
        <div className="space-y-6">
          {/* Action Card: Schedule Visit & Enquire */}
          {user?.role === 'admin' ? (
            <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Admin View Mode</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Administrator accounts have moderation privileges only. Admins <strong>cannot buy, schedule visits, or list properties</strong>.
              </p>
              <div className="pt-2 border-t border-amber-200/60">
                <Link
                  to="/admin/moderation"
                  className="inline-flex items-center justify-center w-full py-2 px-3 text-xs font-semibold bg-forest text-white rounded hover:bg-forest/90 transition-colors"
                >
                  Go to Moderation Dashboard &rarr;
                </Link>
              </div>
            </div>
          ) : user?.role === 'seller' ? (
            <div className="bg-warm-100 border border-warm-200 rounded-lg p-5 space-y-2">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">Seller View</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                You are viewing this listing as a seller. Sellers cannot book visits or enquire on properties. Manage your listings from the seller dashboard.
              </p>
              <Link
                to="/dashboard/seller"
                className="inline-flex items-center justify-center w-full py-2 px-3 text-xs font-semibold bg-white border border-warm-300 text-charcoal rounded hover:bg-warm-50 transition-colors mt-1"
              >
                Seller Dashboard &rarr;
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-warm-200 rounded-lg p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-charcoal">Interested in this property?</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Book a guaranteed conflict-free physical visit or reach out directly to the owner.
              </p>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setVisitModalOpen(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule a Visit
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setEnquiryModalOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Enquiry
              </Button>
            </div>
          )}

          {/* Owner Info Card */}
          <div className="bg-white border border-warm-200 rounded-lg p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
              Listed By
            </h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm">
                {property.owner?.name?.[0] || 'O'}
              </div>
              <div>
                <span className="text-sm font-bold text-charcoal block">{property.owner?.name}</span>
                <span className="text-[11px] text-forest font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Owner</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Request Modal */}
      {visitModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-warm-200 shadow-xl">
            <h3 className="text-base font-bold text-charcoal mb-1">Schedule a Property Visit</h3>
            <p className="text-xs text-charcoal-muted mb-4">
              Select a preferred future date and time slot. Our state machine ensures conflict-free 1-hour slots.
            </p>

            <form onSubmit={handleVisitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-charcoal mb-1">
                  Visit Date (Future Date) *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full text-xs p-2 border border-warm-300 rounded focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-charcoal mb-1">
                  Preferred Time Slot (IST) *
                </label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full text-xs p-2 border border-warm-300 rounded focus:ring-1 focus:ring-forest bg-white"
                >
                  <option value="09:00">09:00 AM - 10:00 AM</option>
                  <option value="10:00">10:00 AM - 11:00 AM</option>
                  <option value="11:00">11:00 AM - 12:00 PM</option>
                  <option value="14:00">02:00 PM - 03:00 PM</option>
                  <option value="15:00">03:00 PM - 04:00 PM</option>
                  <option value="16:00">04:00 PM - 05:00 PM</option>
                  <option value="17:00">05:00 PM - 06:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-charcoal mb-1">
                  Optional Note for Owner
                </label>
                <textarea
                  rows={3}
                  value={visitNote}
                  placeholder="e.g. Planning to visit with family, please confirm parking availability."
                  onChange={(e) => setVisitNote(e.target.value)}
                  className="w-full text-xs p-2 border border-warm-300 rounded focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setVisitModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isVisitSubmitting}
                >
                  Submit Visit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-warm-200 shadow-xl">
            <h3 className="text-base font-bold text-charcoal mb-1">Send Enquiry to Owner</h3>
            <p className="text-xs text-charcoal-muted mb-4">
              Direct message regarding {property.title}.
            </p>

            <form onSubmit={handleEnquirySubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-charcoal mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  className="w-full text-xs p-2 border border-warm-300 rounded focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-charcoal mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                  className="w-full text-xs p-2 border border-warm-300 rounded focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-charcoal mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  className="w-full text-xs p-2 border border-warm-300 rounded focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-charcoal mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                  className="w-full text-xs p-2 border border-warm-300 rounded focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setEnquiryModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isEnquirySubmitting}
                >
                  Send Enquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;
