import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index prevents duplicate favorites and enforces idempotency
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
