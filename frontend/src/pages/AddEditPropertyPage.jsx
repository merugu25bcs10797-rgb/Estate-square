import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import propertyService from '../services/propertyService.js';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { Upload, AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export const AddEditPropertyPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: 'Bangalore',
    address: '',
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'apartment',
    listingType: 'sale',
    areaSqFt: 1200
  });

  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditMode);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadProperty = async () => {
        try {
          const res = await propertyService.getPropertyById(id);
          const p = res.data.property;
          setFormData({
            title: p.title || '',
            description: p.description || '',
            price: p.price || '',
            city: p.city || 'Bangalore',
            address: p.address || '',
            bedrooms: p.bedrooms ?? 2,
            bathrooms: p.bathrooms ?? 2,
            propertyType: p.propertyType || 'apartment',
            listingType: p.listingType || 'sale',
            areaSqFt: p.areaSqFt ?? 1200
          });
          setExistingImages(p.images || []);
          if (p.status === 'rejected') {
            setRejectionReason(p.rejectionReason);
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Could not load property details.');
          navigate('/dashboard/seller');
        } finally {
          setIsLoadingProperty(false);
        }
      };
      loadProperty();
    }
  }, [id, isEditMode, navigate, toast]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 5) {
        toast.warning('Maximum 5 images allowed. Extra files were excluded.');
        setSelectedFiles(filesArray.slice(0, 5));
      } else {
        setSelectedFiles(filesArray);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, val);
      });

      // Append files
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      if (isEditMode) {
        await propertyService.updateProperty(id, data);
        toast.success('Property updated and resubmitted to admin moderation.');
      } else {
        await propertyService.createProperty(data);
        toast.success('Property listing created! Awaiting admin moderation review.');
      }

      navigate('/dashboard/seller');
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please check your inputs.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperty) {
    return <div className="py-20 text-center text-xs text-charcoal-muted">Loading property...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/seller')}
          className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-charcoal"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Seller Dashboard
        </button>
      </div>

      <div className="bg-white border border-warm-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="border-b border-warm-200 pb-4 mb-6">
          <h1 className="text-xl font-bold text-charcoal">
            {isEditMode ? 'Edit Property Listing' : 'List a New Property'}
          </h1>
          <p className="text-xs text-charcoal-muted mt-1">
            All submitted listings are moderated by administrators before appearing publicly.
          </p>
        </div>

        {rejectionReason && (
          <div className="mb-6 p-4 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <span className="font-bold block mb-1">Previous Rejection Reason:</span>
            <p>{rejectionReason}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            label="Listing Title"
            required
            placeholder="e.g. Spacious 3 BHK East Facing Apartment in Indiranagar"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            helperText="Provide a clear, descriptive title between 5 and 120 characters."
          />

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe property amenities, proximity to landmarks, ventilation, furnishing details, etc. (min 20 characters)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-3 border border-warm-300 rounded-md focus:border-forest focus:ring-forest"
            />
          </div>

          {/* Price & Listing Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (INR ₹)"
              type="number"
              required
              placeholder="e.g. 15000000 or 45000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              helperText={
                formData.listingType === 'rent'
                  ? 'Enter monthly rent in Rupees.'
                  : 'Enter total sale price in Rupees.'
              }
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Listing Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.listingType}
                onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-warm-300 rounded-md focus:border-forest focus:ring-forest"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          {/* City & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-warm-300 rounded-md focus:border-forest focus:ring-forest"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <Input
              label="Full Address / Locality"
              required
              placeholder="e.g. 100ft Road, HAL 2nd Stage, Indiranagar"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Bedrooms, Bathrooms, Type, Area */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full text-xs p-2.5 border border-warm-300 rounded-md focus:ring-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full text-xs p-2.5 border border-warm-300 rounded-md focus:ring-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Type
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-warm-300 rounded-md focus:ring-forest"
              >
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="independent_house">House</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Area (sq.ft)
              </label>
              <input
                type="number"
                min="10"
                value={formData.areaSqFt}
                onChange={(e) => setFormData({ ...formData, areaSqFt: e.target.value })}
                className="w-full text-xs p-2.5 border border-warm-300 rounded-md focus:ring-forest"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
              Property Photographs (Max 5 images, max 5 MB each: jpg, png, webp)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-warm-300 border-dashed rounded-md hover:border-forest transition-colors bg-warm-50">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-charcoal-muted" />
                <div className="flex text-xs text-charcoal-muted justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-forest hover:underline focus-within:outline-none"
                  >
                    <span>Upload photos</span>
                    <input
                      id="file-upload"
                      name="images"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-[11px] text-charcoal-muted">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-2 text-xs text-forest font-medium">
                {selectedFiles.length} file(s) selected: {selectedFiles.map((f) => f.name).join(', ')}
              </div>
            )}

            {isEditMode && existingImages.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-charcoal-muted block mb-1.5">Existing Photos:</span>
                <div className="flex space-x-2">
                  {existingImages.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt="Current"
                      className="w-16 h-12 object-cover rounded border border-warm-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-warm-200 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard/seller')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isEditMode ? 'Save & Resubmit Listing' : 'Submit for Moderation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditPropertyPage;
