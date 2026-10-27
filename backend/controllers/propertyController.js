import Property from '../models/Property.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../middleware/uploadMiddleware.js';

export const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      city,
      address,
      bedrooms,
      bathrooms,
      propertyType,
      listingType,
      areaSqFt,
      imageUrls // optional fallback/seed array of URLs
    } = req.body;

    const uploadedImages = [];

    // Process files uploaded via Multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadBufferToCloudinary(file.buffer);
        uploadedImages.push(uploadResult);
      }
    } else if (imageUrls) {
      const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      for (const url of urls.slice(0, 5)) {
        uploadedImages.push({ url, public_id: '' });
      }
    }

    // Default placeholder image if no images provided
    if (uploadedImages.length === 0) {
      uploadedImages.push({
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
        public_id: ''
      });
    }

    // Always enforce owner from session and pending status
    const property = await Property.create({
      title,
      description,
      price: Number(price),
      city,
      address,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      propertyType,
      listingType,
      areaSqFt: areaSqFt ? Number(areaSqFt) : 1000,
      images: uploadedImages,
      status: 'pending',
      owner: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Property listing created successfully and submitted for admin review.',
      data: { property }
    });
  } catch (error) {
    next(error);
  }
};

export const getProperties = async (req, res, next) => {
  try {
    const {
      city,
      listingType,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      sort,
      page = 1,
      limit = 9
    } = req.query;

    // Public search ONLY returns approved listings
    const filter = { status: 'approved' };

    if (city) {
      filter.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    if (listingType) {
      filter.listingType = listingType;
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (bedrooms !== undefined) {
      filter.bedrooms = { $gte: Number(bedrooms) };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // newest default
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'name email phone')
        .lean(),
      Property.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        properties,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone');
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    // If property is not approved, only the owner or an admin may view it
    if (property.status !== 'approved') {
      const isOwner = req.user && req.user._id.toString() === property.owner._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return next(new AppError('Property not found', 404));
      }
    }

    return res.status(200).json({
      success: true,
      data: { property }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { properties }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    // Ownership check: seller cannot edit another seller's listing (403)
    if (property.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Forbidden: You can only edit your own listings', 403));
    }

    const updates = req.body;
    const allowedFields = [
      'title',
      'description',
      'price',
      'city',
      'address',
      'bedrooms',
      'bathrooms',
      'propertyType',
      'listingType',
      'areaSqFt'
    ];

    let hasKeyFieldChange = false;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (property[field] !== updates[field]) {
          property[field] = updates[field];
          hasKeyFieldChange = true;
        }
      }
    }

    // Handle new uploaded images if provided
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const uploadResult = await uploadBufferToCloudinary(file.buffer);
        newImages.push(uploadResult);
      }
      property.images = [...property.images, ...newImages].slice(0, 5);
      hasKeyFieldChange = true;
    }

    // Reset status back to pending if listing was approved or rejected
    if (hasKeyFieldChange) {
      property.status = 'pending';
      property.rejectionReason = '';
    }

    await property.save();

    return res.status(200).json({
      success: true,
      message: 'Property updated successfully and resubmitted for admin review.',
      data: { property }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    // Ownership check
    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return next(new AppError('Forbidden: You do not have permission to delete this listing', 403));
    }

    // Safely remove Cloudinary assets
    for (const img of property.images) {
      if (img.public_id) {
        await deleteFromCloudinary(img.public_id);
      }
    }

    await Property.findByIdAndDelete(property._id);

    return res.status(200).json({
      success: true,
      message: 'Property listing and associated media deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
