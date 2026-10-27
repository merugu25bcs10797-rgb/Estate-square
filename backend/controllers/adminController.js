import Property from '../models/Property.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getPendingProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ status: 'pending' })
      .populate('owner', 'name email phone')
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { properties }
    });
  } catch (error) {
    next(error);
  }
};

export const approveProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    property.status = 'approved';
    property.rejectionReason = '';
    await property.save();

    return res.status(200).json({
      success: true,
      message: 'Property listing approved successfully and is now publicly visible.',
      data: { property }
    });
  } catch (error) {
    next(error);
  }
};

export const rejectProperty = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 5) {
      return next(new AppError('A valid rejection reason (minimum 5 characters) must be provided.', 400));
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    property.status = 'rejected';
    property.rejectionReason = reason.trim();
    await property.save();

    return res.status(200).json({
      success: true,
      message: 'Property listing rejected with reason recorded.',
      data: { property }
    });
  } catch (error) {
    next(error);
  }
};
