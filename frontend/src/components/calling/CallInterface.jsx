import React, { useEffect } from 'react';
import { useCall } from '../../contexts/CallContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

const CallInterface = () => {
  const { 
    call, 
    myVideo, 
    userVideo, 
    callDuration, 
    isMuted, 
    isVideoOff, 
    endCall, 
    cancelCall, 
    toggleMute, 
    toggleVideo 
  } = useCall();

  const isCalling = call.status === 'calling';
  const isConnected = call.status === 'connected';

  if (!isCalling && !isConnected) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center text-white"
      >
        {/* Remote Video (Receiver) */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {call.callType === 'video' ? (
                isConnected ? (
                    <video
                        playsInline
                        ref={userVideo}
                        autoPlay
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                            <Video className="w-16 h-16 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-white/90">
                            {isCalling ? `Calling ${call.name || '...'}` : 'Connecting...'}
                        </h2>
                    </div>
                )
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <Mic className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white/90">
                {isCalling ? `Calling ${call.name || '...'}` : isConnected ? call.name : 'Connecting...'}
              </h2>
              {isConnected && <p className="text-primary font-mono text-xl">{formatTime(callDuration)}</p>}
            </div>
          )}

          {/* Local Video (Sender) - Small thumbnail */}
          {call.callType === 'video' && (
            <div className="absolute top-8 right-8 w-48 h-32 bg-zinc-800 rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl z-10">
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                    <VideoOff className="w-8 h-8 text-zinc-500" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-8 px-4">
          {isConnected && call.callType === 'video' && (
              <p className="text-white/80 font-mono text-lg bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm">
                {formatTime(callDuration)}
              </p>
          )}
          
          <div className="flex gap-6 items-center">
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full w-16 h-16 p-0 border-white/20 hover:bg-white/10 transition-colors ${isMuted ? 'bg-red-500/20 border-red-500/50' : 'bg-white/5'}`}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="w-7 h-7 text-red-500" /> : <Mic className="w-7 h-7" />}
            </Button>

            {call.callType === 'video' && (
              <Button
                variant="outline"
                size="lg"
                className={`rounded-full w-16 h-16 p-0 border-white/20 hover:bg-white/10 transition-colors ${isVideoOff ? 'bg-red-500/20 border-red-500/50' : 'bg-white/5'}`}
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="w-7 h-7 text-red-500" /> : <Video className="w-7 h-7" />}
              </Button>
            )}

            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-20 h-20 p-0 shadow-2xl hover:scale-110 transition-transform"
              onClick={isCalling ? cancelCall : endCall}
            >
              <PhoneOff className="w-10 h-10" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallInterface;
