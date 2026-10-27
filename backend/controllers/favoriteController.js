import Favorite from '../models/Favorite.js';
import Property from '../models/Property.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const toggleFavorite = async (req, res, next) => {
  try {
    const { id: propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      property: propertyId
    });

    if (existingFavorite) {
      // Idempotent removal
      await Favorite.findByIdAndDelete(existingFavorite._id);
      return res.status(200).json({
        success: true,
        message: 'Property removed from saved favorites',
        data: { isFavorite: false }
      });
    }

    // Add favorite
    await Favorite.create({
      user: req.user._id,
      property: propertyId
    });

    return res.status(200).json({
      success: true,
      message: 'Property saved to favorites',
      data: { isFavorite: true }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'property',
        select: 'title price city address bedrooms bathrooms propertyType listingType areaSqFt images status'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out properties that may have been deleted
    const validFavorites = favorites.filter((f) => f.property !== null);

    return res.status(200).json({
      success: true,
      data: { favorites: validFavorites }
    });
  } catch (error) {
    next(error);
  }
};
