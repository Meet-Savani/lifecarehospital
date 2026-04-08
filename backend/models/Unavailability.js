import mongoose from 'mongoose';

const unavailabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  type: { type: String, enum: ['Within a Day', 'Multiple Days'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }, // For single day, this will be same as startDate
  startTime: { type: String, required: true }, // Format "HH:mm"
  endTime: { type: String, required: true },   // Format "HH:mm"
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Unavailability', unavailabilitySchema);
