import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillTitle: {
      type: String,
      required: true,
    },
    sessionDate: {
      type: Date, 
      required: true,
    },
    timeSlot: {
      type: String, 
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;