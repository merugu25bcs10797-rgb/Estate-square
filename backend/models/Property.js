import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be greater than zero']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative'],
      default: 1
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [0, 'Bathrooms cannot be negative'],
      default: 1
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: {
        values: ['apartment', 'villa', 'plot', 'independent_house', 'commercial'],
        message: 'Invalid property type'
      },
      index: true
    },
    listingType: {
      type: String,
      required: [true, 'Listing type is required (sale or rent)'],
      enum: {
        values: ['sale', 'rent'],
        message: 'Listing type must be sale or rent'
      },
      index: true
    },
    areaSqFt: {
      type: Number,
      min: [1, 'Area must be greater than 0'],
      default: 1000
    },
    images: {
      type: [imageSchema],
      validate: [
        (val) => val.length <= 5,
        'A property can have a maximum of 5 images'
      ],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected'
      },
      default: 'pending',
      index: true
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Property owner is required'],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for high performance search queries
propertySchema.index({ status: 1, city: 1, listingType: 1, price: 1 });
propertySchema.index({ status: 1, propertyType: 1, bedrooms: 1 });
propertySchema.index({ owner: 1, createdAt: -1 });

export const Property = mongoose.model('Property', propertySchema);
export default Property;
