import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import { socket } from '@/services/socket';

export default function VideoCall({ otherUserId, otherUserName, isIncoming, incomingSignal, onEndCall }) {
  const [callActive, setCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(!isIncoming);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const peerConnection = useRef();

  useEffect(() => {
    const initCall = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(localStream);
        if (myVideo.current) myVideo.current.srcObject = localStream;

        if (isIncoming && incomingSignal) {
          // Handle incoming - this logic will be more complex with signaling
          // For now, let's set up the basic structure
        }
      } catch (err) {
        console.error("Failed to get local stream", err);
      }
    };

    initCall();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []);

  const startCall = () => {
    // Logic for WebRTC peer connection and signaling (socket.emit('call_user', ...))
    setCallActive(true);
    setIsCalling(false);
  };

  const answerCall = () => {
    setCallActive(true);
    // socket.emit('answer_call', ...)
  };

  const endCall = () => {
    if (onEndCall) onEndCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {/* Remote Video */}
        <div className="absolute inset-0 flex items-center justify-center">
          {remoteStream ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-4 text-white">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 animate-pulse">
                <Video className="w-10 h-10 text-primary" />
              </div>
              <p className="text-xl font-medium">{isCalling ? `Calling ${otherUserName}...` : `Incoming call from ${otherUserName}`}</p>
            </div>
          )}
        </div>

        {/* Local Video - Small Overlay */}
        <div className="absolute top-6 right-6 w-1/4 aspect-video bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-xl z-20">
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-30">
          <Button 
            variant="outline" 
            size="icon" 
            className={`w-14 h-14 rounded-full border-none shadow-lg ${isMuted ? 'bg-destructive/20 text-destructive' : 'bg-white/10 text-white hover:bg-white/20'}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            className={`w-14 h-14 rounded-full border-none shadow-lg ${isVideoOff ? 'bg-destructive/20 text-destructive' : 'bg-white/10 text-white hover:bg-white/20'}`}
            onClick={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>

          {isIncoming && !callActive ? (
            <Button 
              className="w-16 h-16 rounded-full bg-success hover:bg-success/90 shadow-lg shadow-success/30 animate-bounce"
              onClick={answerCall}
            >
              <Phone className="w-8 h-8 text-white rotate-[135deg]" />
            </Button>
          ) : null}

          <Button 
            className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/30"
            onClick={endCall}
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
