import mongoose from 'mongoose';

const callHistorySchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  callType: { type: String, enum: ['audio', 'video'], required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number }, // in seconds
  status: { 
    type: String, 
    enum: ['completed', 'missed', 'cancelled', 'rejected'], 
    default: 'missed' 
  }
}, { timestamps: true });

export default mongoose.model('CallHistory', callHistorySchema);
