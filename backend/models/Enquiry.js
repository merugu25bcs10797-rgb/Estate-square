import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'closed'],
        message: 'Invalid enquiry status'
      },
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

enquirySchema.index({ seller: 1, createdAt: -1 });
enquirySchema.index({ buyer: 1, createdAt: -1 });

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
