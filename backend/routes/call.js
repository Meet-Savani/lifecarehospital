import express from 'express';
import CallHistory from '../models/CallHistory.js';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

const router = express.Router();

// Get call history for a specific chat
router.get('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const history = await CallHistory.find({ chatId })
      .sort({ startTime: -1 })
      .populate('callerId', 'fullName avatarUrl')
      .populate('receiverId', 'fullName avatarUrl');
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a call history record (called when a call is finalized: completed, missed, or rejected)
router.post('/', async (req, res) => {
  try {
    const { callerId, receiverId, chatId, callType, status, startTime, endTime, duration } = req.body;
    
    const callRecord = new CallHistory({
      callerId,
      receiverId,
      chatId,
      callType,
      status,
      startTime,
      endTime,
      duration
    });

    await callRecord.save();

    // Also create a message in the chat to reflect the call history
    if (chatId) {
      let messageContent = '';
      if (status === 'completed') {
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        messageContent = `${callType.charAt(0).toUpperCase() + callType.slice(1)} call - ${mins}m ${secs}s`;
      } else if (status === 'missed') {
        messageContent = `Missed ${callType} call`;
      } else if (status === 'rejected') {
        messageContent = `Rejected ${callType} call`;
      } else if (status === 'cancelled') {
        messageContent = `Cancelled ${callType} call`;
      }

      const newMessage = new Message({
        chatId,
        senderId: callerId,
        message: messageContent,
        type: 'call',
      });

      await newMessage.save();

      // Update chat last message
      await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id, updatedAt: Date.now() });
    }

    res.status(201).json(callRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
