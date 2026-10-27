import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import propertyService from '../services/propertyService.js';
import visitService from '../services/visitService.js';
import enquiryService from '../services/enquiryService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice, formatISTDateTime } from '../utils/formatters.js';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import {
  Building,
  Calendar,
  MessageSquare,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';

export const SellerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'visits' | 'enquiries'
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propRes, visitRes, enqRes] = await Promise.all([
        propertyService.getMyProperties(),
        visitService.getReceivedVisits(),
        enquiryService.getReceivedEnquiries()
      ]);
      setProperties(propRes.data.properties || []);
      setVisits(visitRes.data.visits || []);
      setEnquiries(enqRes.data.enquiries || []);
    } catch (err) {
      toast.error('Could not load some dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Delete
  const confirmDelete = (property) => {
    setPropertyToDelete(property);
    setDeleteModalOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    try {
      await propertyService.deleteProperty(propertyToDelete._id);
      toast.success('Property listing deleted successfully.');
      setProperties((prev) => prev.filter((p) => p._id !== propertyToDelete._id));
      setDeleteModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Visit status transitions
  const handleVisitStatusChange = async (visitId, newStatus) => {
    try {
      await visitService.updateVisitStatus(visitId, newStatus);
      toast.success(`Visit marked as ${newStatus}.`);
      setVisits((prev) =>
        prev.map((v) => (v._id === visitId ? { ...v, status: newStatus } : v))
      );
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to update visit to ${newStatus}.`;
      toast.error(msg);
    }
  };

  // Handle Enquiry status transitions
  const handleEnquiryStatusChange = async (enquiryId, newStatus) => {
    try {
      await enquiryService.updateEnquiryStatus(enquiryId, newStatus);
      toast.success(`Enquiry marked as ${newStatus}.`);
      setEnquiries((prev) =>
        prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update enquiry status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-warm-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-emerald-100 text-forest text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Owner Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">
            Seller Dashboard
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage your property listings, schedule visits, and respond to direct buyer enquiries
          </p>
        </div>

        <Link to="/property/new">
          <Button variant="primary" size="md">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Post New Property
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-warm-200 mt-6">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'properties'
              ? 'border-forest text-forest'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>My Listings ({properties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'visits'
              ? 'border-forest text-forest'
              : 'border-transparent text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Received Visits ({visits.length})</span>
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
          <span>Buyer Enquiries ({enquiries.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-charcoal-muted">
            Loading dashboard data...
          </div>
        ) : activeTab === 'properties' ? (
          /* Properties Tab */
          properties.length === 0 ? (
            <div className="text-center py-20 bg-white border border-warm-200 rounded-lg p-8">
              <Building className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal">You haven't listed any properties yet</h3>
              <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
                Post your residential or commercial property to connect with verified buyers.
              </p>
              <div className="mt-5">
                <Link to="/property/new">
                  <Button variant="primary" size="sm">
                    Post Your First Property
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((p) => (
                <div
                  key={p._id}
                  className="bg-white border border-warm-200 rounded-lg p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-xs"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={
                        p.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={p.title}
                      className="w-24 h-20 rounded object-cover flex-shrink-0 bg-warm-200 border border-warm-200"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-bold text-charcoal">
                          {formatPrice(p.price, p.listingType)}
                        </span>
                        <Badge variant={p.listingType}>For {p.listingType}</Badge>
                        <Badge variant={p.status}>{p.status}</Badge>
                      </div>

                      <h3 className="text-sm font-semibold text-charcoal">{p.title}</h3>
                      <p className="text-xs text-charcoal-muted mt-0.5">
                        {p.address}, {p.city} &bull; {p.bedrooms} BHK &bull; {p.propertyType}
                      </p>

                      {p.status === 'rejected' && p.rejectionReason && (
                        <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded p-1.5 mt-2">
                          <strong>Admin Feedback:</strong> {p.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-center">
                    <Link to={`/property/${p._id}`}>
                      <Button variant="secondary" size="sm" title="View details">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/property/${p._id}/edit`}>
                      <Button variant="secondary" size="sm" title="Edit property">
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDelete(p)}
                      title="Delete property"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'visits' ? (
          /* Visits Tab */
          visits.length === 0 ? (
            <div className="text-center py-20 bg-white border border-warm-200 rounded-lg p-8">
              <Calendar className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal">No visits requested yet</h3>
              <p className="text-xs text-charcoal-muted mt-1">
                When buyers schedule visits on your approved properties, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((v) => (
                <div
                  key={v._id}
                  className="bg-white border border-warm-200 rounded-lg p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-xs font-bold text-charcoal">
                        {v.property?.title || 'Property'}
                      </span>
                      <Badge variant={v.status}>{v.status}</Badge>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-forest font-semibold mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Scheduled: {formatISTDateTime(v.visitDate)} (IST)</span>
                    </div>

                    <div className="mt-2 text-xs text-charcoal-muted space-y-0.5">
                      <p>
                        Buyer: <strong className="text-charcoal">{v.buyer?.name}</strong> ({v.buyer?.email})
                      </p>
                      {v.note && <p className="italic text-[11px]">"{v.note}"</p>}
                    </div>
                  </div>

                  {/* State Machine Actions */}
                  <div className="flex items-center space-x-2 self-end md:self-center">
                    {v.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleVisitStatusChange(v._id, 'confirmed')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleVisitStatusChange(v._id, 'rejected')}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {v.status === 'confirmed' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleVisitStatusChange(v._id, 'completed')}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleVisitStatusChange(v._id, 'cancelled')}
                        >
                          Cancel Visit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Enquiries Tab */
          enquiries.length === 0 ? (
            <div className="text-center py-20 bg-white border border-warm-200 rounded-lg p-8">
              <MessageSquare className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal">No buyer enquiries yet</h3>
              <p className="text-xs text-charcoal-muted mt-1">
                Enquiries submitted on your properties will be listed here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((e) => (
                <div
                  key={e._id}
                  className="bg-white border border-warm-200 rounded-lg p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-xs"
                >
                  <div className="max-w-2xl">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-xs font-bold text-charcoal">
                        Re: {e.property?.title || 'Property'}
                      </span>
                      <Badge variant={e.status}>{e.status}</Badge>
                    </div>

                    <p className="text-xs text-charcoal mt-1 bg-warm-50 p-2.5 rounded border border-warm-200">
                      "{e.message}"
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted mt-2">
                      <span className="font-semibold text-charcoal">{e.name}</span>
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-forest" />
                        <span>{e.email}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-forest" />
                        <span>{e.phone}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-center">
                    {e.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEnquiryStatusChange(e._id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEnquiryStatusChange(e._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {e.status === 'accepted' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEnquiryStatusChange(e._id, 'closed')}
                      >
                        Close Enquiry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Property Listing"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>
              Are you sure you want to delete <strong>{propertyToDelete?.title}</strong>? This action will permanently remove the listing and all associated media from Cloudinary.
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteExecute}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SellerDashboardPage;
