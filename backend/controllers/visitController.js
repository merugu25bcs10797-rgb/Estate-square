import Visit from '../models/Visit.js';
import Property from '../models/Property.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { hasVisitConflict } from '../utils/visitConflict.js';

export const createVisit = async (req, res, next) => {
  try {
    const { id: propertyId } = req.params;
    const { visitDate, note } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    if (property.status !== 'approved') {
      return next(new AppError('Visits can only be requested for approved listings.', 400));
    }

    // Owner cannot request visit on their own listing
    if (property.owner.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot request a visit on your own property.', 400));
    }

    const targetDate = new Date(visitDate);
    if (isNaN(targetDate.getTime())) {
      return next(new AppError('Invalid date format for visit request.', 400));
    }

    // Reject past dates (strictly future dates required)
    if (targetDate.getTime() <= Date.now()) {
      return next(new AppError('Visit date and time must be scheduled in the future.', 400));
    }

    const visit = await Visit.create({
      property: propertyId,
      buyer: req.user._id,
      seller: property.owner,
      visitDate: targetDate, // Stored in UTC
      status: 'pending',
      note: note || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Visit requested successfully! Awaiting owner confirmation.',
      data: { visit }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyVisits = async (req, res, next) => {
  try {
    // Buyer can only view their own visits
    const visits = await Visit.find({ buyer: req.user._id })
      .populate('property', 'title price city address images status listingType')
      .populate('seller', 'name email phone')
      .sort({ visitDate: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { visits }
    });
  } catch (error) {
    next(error);
  }
};

export const getReceivedVisits = async (req, res, next) => {
  try {
    // Seller can only view visits scheduled on their properties
    const visits = await Visit.find({ seller: req.user._id })
      .populate('property', 'title price city address images listingType')
      .populate('buyer', 'name email phone')
      .sort({ visitDate: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { visits }
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: targetStatus, sellerNote } = req.body;

    const visit = await Visit.findById(id);
    if (!visit) {
      return next(new AppError('Visit request not found', 404));
    }

    const isBuyer = visit.buyer.toString() === req.user._id.toString();
    const isSeller = visit.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Must be a participant or admin
    if (!isBuyer && !isSeller && !isAdmin) {
      return next(new AppError('Forbidden: You are not authorized to view or manage this visit.', 403));
    }

    const currentStatus = visit.status;

    // Strict state machine validation
    // Allowed transitions:
    // pending -> confirmed | rejected | cancelled
    // confirmed -> cancelled | completed
    // Everything else returns 409 Conflict

    if (currentStatus === 'pending') {
      if (targetStatus === 'confirmed') {
        if (!isSeller && !isAdmin) {
          return next(new AppError('Only the seller can confirm a pending visit.', 403));
        }

        // Check 1-hour slot double booking conflict
        const conflict = await hasVisitConflict(visit.property, visit.visitDate, visit._id);
        if (conflict) {
          return next(
            new AppError(
              'Conflict: This property already has a confirmed visit scheduled within 1 hour of this time slot. Please reschedule or reject.',
              409
            )
          );
        }
      } else if (targetStatus === 'rejected') {
        if (!isSeller && !isAdmin) {
          return next(new AppError('Only the seller can reject a pending visit.', 403));
        }
      } else if (targetStatus === 'cancelled') {
        if (!isBuyer && !isAdmin) {
          return next(new AppError('Only the buyer can cancel a pending visit.', 403));
        }
      } else {
        return next(
          new AppError(
            `Invalid state transition: Cannot change status from '${currentStatus}' to '${targetStatus}'.`,
            409
          )
        );
      }
    } else if (currentStatus === 'confirmed') {
      if (targetStatus === 'cancelled') {
        // Both buyer and seller can cancel a confirmed visit
      } else if (targetStatus === 'completed') {
        // Either party or admin can mark visit completed
      } else {
        return next(
          new AppError(
            `Invalid state transition: Cannot change status from '${currentStatus}' to '${targetStatus}'.`,
            409
          )
        );
      }
    } else {
      // Terminal states: rejected, cancelled, completed
      return next(
        new AppError(
          `Invalid state transition: Visit is already '${currentStatus}' and cannot be altered.`,
          409
        )
      );
    }

    // Apply updates
    visit.status = targetStatus;
    if (sellerNote !== undefined) {
      visit.sellerNote = sellerNote;
    }

    await visit.save();

    return res.status(200).json({
      success: true,
      message: `Visit request status successfully updated to '${targetStatus}'.`,
      data: { visit }
    });
  } catch (error) {
    next(error);
  }
};
