import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CallContext = createContext(undefined);

export const CallProvider = ({ children }) => {
  const { socket, on, off, emit } = useSocket();
  const { user } = useAuth();
  
  const [call, setCall] = useState({
    isReceivingCall: false,
    from: null,
    name: null,
    signal: null,
    callType: 'video',
    status: 'idle' // idle, ringing, calling, connected, ended
  });
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [otherUser, setOtherUser] = useState(null); // The person we are talking to
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const timerRef = useRef();
  const localStreamRef = useRef();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!socket) return;

    on('incoming_call', ({ from, name, signal, callType }) => {
      setCall({ isReceivingCall: true, from, name, signal, callType, status: 'ringing' });
    });

    on('call_accepted', ({ signal, answererId }) => {
      setCall(prev => ({ ...prev, status: 'connected' }));
      if (connectionRef.current) {
        connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    on('call_rejected', () => {
      endCallLocally('rejected');
    });

    on('call_cancelled', () => {
      endCallLocally('cancelled');
    });

    on('call_ended', () => {
      endCallLocally('completed');
    });

    on('ice_candidate', ({ candidate }) => {
      if (connectionRef.current) {
        connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      }
    });

    on('call_accepted_elsewhere', () => {
      // If call was accepted on another device, reset this one
      resetCallState();
    });

    return () => {
      off('incoming_call');
      off('call_accepted');
      off('call_rejected');
      off('call_cancelled');
      off('call_ended');
      off('ice_candidate');
      off('call_accepted_elsewhere');
    };
  }, [socket, on, off]);

  useEffect(() => {
    if (call.status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [call.status]);

  const resetCallState = () => {
    setCall({ isReceivingCall: false, from: null, name: null, signal: null, callType: 'video', status: 'idle' });
    setStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    setOtherUser(null);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  const setupWebRTC = async (isCaller) => {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            emit('ice_candidate', { to: isCaller ? otherUser?.id : call.from, candidate: event.candidate });
        }
    };

    peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (userVideo.current) {
            userVideo.current.srcObject = event.streams[0];
        }
    };

    const localStream = await navigator.mediaDevices.getUserMedia({
        video: call.callType === 'video',
        audio: true
    });
    
    setStream(localStream);
    localStreamRef.current = localStream;
    if (myVideo.current) {
        myVideo.current.srcObject = localStream;
    }

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    connectionRef.current = peerConnection;
    return peerConnection;
  };

  const callUser = async (id, name, type, chatId) => {
    setOtherUser({ id, name, chatId });
    setCall(prev => ({ ...prev, callType: type, status: 'calling' }));

    const peerConnection = await setupWebRTC(true);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    emit('call_user', {
        userToCall: id,
        signalData: offer,
        from: user._id,
        name: user.fullName,
        callType: type
    });

    // Missed call timeout (30 seconds)
    timerRef.current = setTimeout(() => {
        if (connectionRef.current && connectionRef.current.connectionState !== 'connected') {
            emit('cancel_call', { to: id });
            saveCallHistory('missed');
            resetCallState();
        }
    }, 30000);
  };

  const answerCall = async () => {
    const peerConnection = await setupWebRTC(false);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(call.signal));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    setCall(prev => ({ ...prev, status: 'connected' }));
    
    emit('answer_call', { 
        signal: answer, 
        to: call.from, 
        answererId: user._id,
        receiverId: user._id // for multi-device sync
    });
  };

  const rejectCall = () => {
    emit('reject_call', { to: call.from });
    saveCallHistory('rejected');
    resetCallState();
  };

  const cancelCall = () => {
    emit('cancel_call', { to: otherUser?.id });
    saveCallHistory('cancelled');
    resetCallState();
  };

  const endCall = () => {
    const targetId = otherUser?.id || call.from;
    emit('end_call', { to: targetId });
    saveCallHistory('completed');
    resetCallState();
  };

  const endCallLocally = (status) => {
    // If not initiated by us, we might still want to save history if we were the receiver
    // But usually one side saves it. Let's make the caller save it or both? 
    // To avoid duplicates, let's make the one who clicks 'End' or the 'Caller' save it.
    // Actually, saving on backend is better but we'll do it from frontend for simplicity here.
    resetCallState();
  };

  const saveCallHistory = async (status) => {
    const targetId = otherUser?.id || call.from;
    const chatId = otherUser?.chatId || null; // We'd need chatId to show in chat
    
    try {
        await axios.post(`${API_URL}/calls`, {
            callerId: otherUser ? user._id : call.from,
            receiverId: otherUser ? otherUser.id : user._id,
            chatId: chatId,
            callType: call.callType,
            status: status,
            startTime: new Date(Date.now() - callDuration * 1000),
            endTime: new Date(),
            duration: callDuration
        });
    } catch (error) {
        console.error('Failed to save call history:', error);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <CallContext.Provider value={{
      call,
      stream,
      remoteStream,
      myVideo,
      userVideo,
      callDuration,
      isMuted,
      isVideoOff,
      callUser,
      answerCall,
      rejectCall,
      cancelCall,
      endCall,
      toggleMute,
      toggleVideo
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
