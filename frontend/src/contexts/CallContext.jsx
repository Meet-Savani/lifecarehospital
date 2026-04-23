import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CallContext = createContext(undefined);

// Sound URLs
const INCOMING_RING_URL = "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3"; 
const OUTGOING_RING_URL = "https://www.soundjay.com/phone/phone-calling-1.mp3";

export const CallProvider = ({ children }) => {
  const { socket, on, off, emit } = useSocket();
  const { user } = useAuth();
  
  const [call, setCall] = useState({
    isReceivingCall: false,
    from: null,
    name: null,
    signal: null,
    callType: 'video',
    status: 'idle' // idle, ringing, calling, connected, ended, rejected, cancelled
  });
  
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [otherUser, setOtherUser] = useState(null);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const timerRef = useRef();
  const localStreamRef = useRef();
  const timeoutRef = useRef();
  
  const incomingRing = useRef(new Audio(INCOMING_RING_URL));
  const outgoingRing = useRef(new Audio(OUTGOING_RING_URL));

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Configure audio loops
  useEffect(() => {
    incomingRing.current.loop = true;
    outgoingRing.current.loop = true;
  }, []);

  const playSound = (type) => {
    try {
        if (type === 'incoming') {
            incomingRing.current.play().catch(e => console.log("Sound play error:", e));
        } else if (type === 'outgoing') {
            outgoingRing.current.play().catch(e => console.log("Sound play error:", e));
        }
    } catch (e) {}
  };

  const stopSounds = useCallback(() => {
    incomingRing.current.pause();
    incomingRing.current.currentTime = 0;
    outgoingRing.current.pause();
    outgoingRing.current.currentTime = 0;
  }, []);

  const resetCallState = useCallback(() => {
    stopSounds();
    setCall({ isReceivingCall: false, from: null, name: null, signal: null, callType: 'video', status: 'idle' });
    setStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    setOtherUser(null);
    setIsMuted(false);
    setIsVideoOff(false);
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (connectionRef.current) {
        connectionRef.current.close();
        connectionRef.current = null;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [stopSounds]);

  useEffect(() => {
    if (!socket) return;

    on('incoming_call', ({ from, name, signal, callType }) => {
      setCall({ isReceivingCall: true, from, name, signal, callType, status: 'ringing' });
      playSound('incoming');
    });

    on('call_accepted', async ({ signal, answererId }) => {
      stopSounds();
      setCall(prev => ({ ...prev, status: 'connected' }));
      if (connectionRef.current) {
        try {
            await connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        } catch (e) {
            console.error("Error setting remote description:", e);
        }
      }
    });

    on('call_rejected', () => {
      stopSounds();
      setCall(prev => ({ ...prev, status: 'rejected' }));
      setTimeout(resetCallState, 2000);
    });

    on('call_cancelled', () => {
      stopSounds();
      setCall(prev => ({ ...prev, status: 'cancelled' }));
      setTimeout(resetCallState, 2000);
    });

    on('call_ended', () => {
      stopSounds();
      setCall(prev => ({ ...prev, status: 'ended' }));
      setTimeout(resetCallState, 2000);
    });

    on('ice_candidate', async ({ candidate }) => {
      if (connectionRef.current) {
        try {
            if (connectionRef.current.remoteDescription) {
                await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                console.log("Buffering ICE candidate as remote description is not set");
                // In some cases we might need a buffer, but simple catch is often enough
            }
        } catch (e) {
            console.error("Error adding ICE candidate:", e);
        }
      }
    });

    on('call_accepted_elsewhere', () => {
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
  }, [socket, on, off, resetCallState, stopSounds]);

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

  const setupWebRTC = async (isCaller) => {
    // Buffering ICE candidates if remote description isn't set yet
    const iceCandidatesBuffer = useRef([]);
    
    // Configuration with standard STUN and placeholders for TURN
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            // Note: For production, consider adding a paid TURN server like Twilio or OpenRelay
        ],
        iceCandidatePoolSize: 10,
    });

    peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE Connection State:", peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === 'failed') {
            peerConnection.restartIce();
        }
    };

    peerConnection.onconnectionstatechange = () => {
        console.log("Connection State:", peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected') {
            // Potential temporary drop, wait or end
        } else if (peerConnection.connectionState === 'failed') {
            endCall();
        }
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            emit('ice_candidate', { 
                to: isCaller ? otherUser?.id : call.from, 
                candidate: event.candidate 
            });
        }
    };

    peerConnection.ontrack = (event) => {
        console.log("Remote track received:", event.streams[0]);
        setRemoteStream(event.streams[0]);
    };

    try {
        const localStream = await navigator.mediaDevices.getUserMedia({
            video: call.callType === 'video' || isVideoOff === false,
            audio: true
        });
        
        setStream(localStream);
        localStreamRef.current = localStream;

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    } catch (err) {
        console.error("Failed to get local stream", err);
        alert("Could not access camera/microphone. Please check permissions.");
    }

    connectionRef.current = peerConnection;
    return peerConnection;
  };

  const callUser = async (id, name, type, chatId) => {
    setOtherUser({ id, name, chatId });
    setCall(prev => ({ ...prev, callType: type, status: 'calling', name }));
    playSound('outgoing');

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

    timeoutRef.current = setTimeout(() => {
        if (connectionRef.current && connectionRef.current.connectionState !== 'connected') {
            cancelCall();
            saveCallHistory('missed');
        }
    }, 45000);
  };

  const answerCall = async () => {
    stopSounds();
    const peerConnection = await setupWebRTC(false);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(call.signal));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    setCall(prev => ({ ...prev, status: 'connected' }));
    
    emit('answer_call', { 
        signal: answer, 
        to: call.from, 
        answererId: user._id,
        receiverId: user._id
    });
  };

  const rejectCall = () => {
    stopSounds();
    emit('reject_call', { to: call.from });
    saveCallHistory('rejected');
    setCall(prev => ({ ...prev, status: 'rejected' }));
    setTimeout(resetCallState, 1000);
  };

  const cancelCall = () => {
    stopSounds();
    emit('cancel_call', { to: otherUser?.id || call.from });
    saveCallHistory('cancelled');
    setCall(prev => ({ ...prev, status: 'cancelled' }));
    setTimeout(resetCallState, 1000);
  };

  const endCall = () => {
    stopSounds();
    const targetId = otherUser?.id || call.from;
    emit('end_call', { to: targetId });
    saveCallHistory('completed');
    setCall(prev => ({ ...prev, status: 'ended' }));
    setTimeout(resetCallState, 1000);
  };

  const saveCallHistory = async (status) => {
    const targetId = otherUser?.id || call.from;
    const chatId = otherUser?.chatId || null;
    
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
