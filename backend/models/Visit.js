import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date and time is required'],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
        message: 'Invalid visit status'
      },
      default: 'pending',
      index: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    sellerNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

visitSchema.index({ property: 1, visitDate: 1, status: 1 });
visitSchema.index({ seller: 1, createdAt: -1 });
visitSchema.index({ buyer: 1, createdAt: -1 });

export const Visit = mongoose.model('Visit', visitSchema);
export default Visit;
