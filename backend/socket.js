import { Server } from 'socket.io';

let io;
const users = {}; // userId -> [socketId1, socketId2, ...]

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    socket.on('register_user', (userId) => {
      if (userId) {
        if (!users[userId]) {
          users[userId] = [];
        }
        if (!users[userId].includes(socket.id)) {
          users[userId].push(socket.id);
        }
        socket.join(userId);
      }
    });

    socket.on('join_chat', (chatId) => {
      socket.pushId = socket.id; // Just for internal reference if needed
      socket.join(chatId);
    });

    socket.on('join_blog_room', (blogId) => {
      socket.join(`blog_${blogId}`);
    });

    socket.on('send_message', (data) => {
      socket.to(data.chatId).emit('receive_message', data);
    });

    socket.on('typing', ({ chatId, userId }) => {
      socket.to(chatId).emit('user_typing', { userId });
    });

    // --- Video/Audio Call Signaling ---
    
    // Caller initiates a call
    socket.on('call_user', ({ userToCall, signalData, from, name, callType }) => {
      console.log(`[CALL] From ${from} to ${userToCall} (${callType})`);
      // Emit to all devices of the receiver
      io.to(userToCall).emit('incoming_call', { signal: signalData, from, name, callType });
    });

    // Receiver accepts the call
    socket.on('answer_call', (data) => {
      console.log(`[CALL] Accepted by ${data.answererId} for caller ${data.to}`);
      // Emit to all devices of the caller (signaling)
      io.to(data.to).emit('call_accepted', { signal: data.signal, answererId: data.answererId });
      
      // Notify other devices of the receiver that the call was accepted elsewhere
      socket.to(data.receiverId).emit('call_accepted_elsewhere', { by: socket.id });
    });

    // Caller cancels before acceptance
    socket.on('cancel_call', ({ to }) => {
      io.to(to).emit('call_cancelled');
    });

    // Either side ends the call
    socket.on('end_call', ({ to }) => {
      io.to(to).emit('call_ended');
    });

    // Receiver rejects the call
    socket.on('reject_call', ({ to }) => {
      io.to(to).emit('call_rejected');
    });

    socket.on('ice_candidate', ({ to, candidate }) => {
      // console.log(`[ICE] Candidate for ${to}`);
      io.to(to).emit('ice_candidate', { candidate, from: socket.id });
    });

    socket.on('disconnect', () => {
      Object.keys(users).forEach(userId => {
        users[userId] = users[userId].filter(id => id !== socket.id);
        if (users[userId].length === 0) {
          delete users[userId];
        }
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
