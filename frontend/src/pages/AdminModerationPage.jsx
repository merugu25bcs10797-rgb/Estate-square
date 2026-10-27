import React, { useState, useEffect, useCallback } from 'react';
import propertyService from '../services/propertyService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/formatters.js';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, MapPin, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminModerationPage = () => {
  const [pendingProperties, setPendingProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const toast = useToast();

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await propertyService.getPendingProperties();
      setPendingProperties(res.data.properties || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch pending properties.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id) => {
    setIsProcessing(true);
    try {
      await propertyService.approveProperty(id);
      toast.success('Listing approved and published publicly!');
      setPendingProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve listing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (property) => {
    setSelectedProperty(property);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;
    if (rejectionReason.trim().length < 5) {
      toast.error('Rejection reason must be at least 5 characters long.');
      return;
    }

    setIsProcessing(true);
    try {
      await propertyService.rejectProperty(selectedProperty._id, rejectionReason.trim());
      toast.success('Listing rejected with reason notified to seller.');
      setPendingProperties((prev) => prev.filter((p) => p._id !== selectedProperty._id));
      setRejectModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject listing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-warm-200 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Moderation Queue</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">
            Listing Moderation & Verification
          </h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Review new and updated seller listings before granting public marketplace visibility.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchPending} disabled={isLoading}>
          Refresh Queue ({pendingProperties.length})
        </Button>
      </div>

      {/* Main Queue */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-charcoal-muted">
            Loading pending queue...
          </div>
        ) : pendingProperties.length === 0 ? (
          <div className="text-center py-20 bg-white border border-warm-200 rounded-lg p-8">
            <CheckCircle2 className="w-12 h-12 text-forest mx-auto mb-3" />
            <h3 className="text-base font-bold text-charcoal">Moderation Queue is Clear!</h3>
            <p className="text-xs text-charcoal-muted mt-1">
              There are currently no listings awaiting approval. All seller submissions have been reviewed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProperties.map((prop) => (
              <div
                key={prop._id}
                className="bg-white border border-warm-200 rounded-lg p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between shadow-xs"
              >
                {/* Image & Main Info */}
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      prop.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={prop.title}
                    className="w-24 h-20 rounded object-cover flex-shrink-0 bg-warm-200 border border-warm-200"
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-bold text-charcoal">
                        {formatPrice(prop.price, prop.listingType)}
                      </span>
                      <Badge variant={prop.listingType}>For {prop.listingType}</Badge>
                      <Badge variant="pending">Pending Review</Badge>
                    </div>

                    <h3 className="text-sm font-semibold text-charcoal">{prop.title}</h3>

                    <div className="flex items-center text-xs text-charcoal-muted mt-1 space-x-3">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 text-forest mr-1" />
                        {prop.address}, {prop.city}
                      </span>
                      <span>&bull;</span>
                      <span>{prop.bedrooms} BHK</span>
                      <span>&bull;</span>
                      <span>{prop.propertyType}</span>
                    </div>

                    <p className="text-[11px] text-charcoal-muted mt-1">
                      Submitted by: <strong className="text-charcoal">{prop.owner?.name}</strong> ({prop.owner?.email})
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end md:self-center w-full md:w-auto justify-end">
                  <Link to={`/property/${prop._id}`} target="_blank">
                    <Button variant="secondary" size="sm">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Preview
                    </Button>
                  </Link>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openRejectModal(prop)}
                    disabled={isProcessing}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(prop._id)}
                    disabled={isProcessing}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve Listing
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal with Reason */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Listing Submission"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
            Please provide a specific rejection reason. The seller will see this reason, edit their submission, and resubmit for verification.
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-charcoal mb-1">
              Rejection Reason * (min 5 characters)
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. Please provide clearer interior photographs and verify the exact street address."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-3 border border-warm-300 rounded focus:ring-forest"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isProcessing}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminModerationPage;
