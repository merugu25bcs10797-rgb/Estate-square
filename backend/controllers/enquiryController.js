import Enquiry from '../models/Enquiry.js';
import Property from '../models/Property.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const createEnquiry = async (req, res, next) => {
  try {
    const { id: propertyId } = req.params;
    const { name, email, phone, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    if (property.status !== 'approved') {
      return next(new AppError('Enquiries can only be submitted for approved listings', 400));
    }

    // Prevent seller from enquiring on their own property
    if (property.owner.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot submit an enquiry on your own listing.', 400));
    }

    const enquiry = await Enquiry.create({
      property: propertyId,
      buyer: req.user._id,
      seller: property.owner,
      name,
      email,
      phone,
      message,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been successfully delivered to the property owner.',
      data: { enquiry }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEnquiries = async (req, res, next) => {
  try {
    // Buyer can only see their own enquiries
    const enquiries = await Enquiry.find({ buyer: req.user._id })
      .populate('property', 'title price city address images status listingType')
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { enquiries }
    });
  } catch (error) {
    next(error);
  }
};

export const getReceivedEnquiries = async (req, res, next) => {
  try {
    // Seller can only see enquiries received for their properties
    const enquiries = await Enquiry.find({ seller: req.user._id })
      .populate('property', 'title price city address images listingType')
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { enquiries }
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return next(new AppError('Enquiry not found', 404));
    }

    // Only the seller who received this enquiry can update its status
    const isSeller = enquiry.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isSeller && !isAdmin) {
      return next(new AppError('Forbidden: You can only update enquiries for your properties.', 403));
    }

    enquiry.status = status;
    await enquiry.save();

    return res.status(200).json({
      success: true,
      message: `Enquiry status updated to ${status}.`,
      data: { enquiry }
    });
  } catch (error) {
    next(error);
  }
};
