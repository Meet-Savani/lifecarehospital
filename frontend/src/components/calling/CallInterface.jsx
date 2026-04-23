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
  const isRinging = call.status === 'ringing';
  const isEnded = ['ended', 'rejected', 'cancelled'].includes(call.status);

  if (call.status === 'idle' || (call.isReceivingCall && !isConnected && !isEnded)) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    if (call.status === 'calling') return 'Calling...';
    if (call.status === 'connected') return formatTime(callDuration);
    if (call.status === 'rejected') return 'Call Rejected';
    if (call.status === 'cancelled') return 'Call Cancelled';
    if (call.status === 'ended') return 'Call Ended';
    return 'Connecting...';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-zinc-950 flex flex-col items-center justify-center text-white overflow-hidden"
      >
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Header / Info */}
        <div className="absolute top-12 left-0 right-0 z-20 flex flex-col items-center gap-2">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                    {call.callType} call secured
                </p>
            </motion.div>
            <h2 className="text-4xl font-black tracking-tight mt-4">
                {call.name || 'Care Provider'}
            </h2>
            <p className={`text-lg font-medium transition-colors duration-500 ${isEnded ? 'text-red-400' : 'text-primary/80'}`}>
                {getStatusDisplay()}
            </p>
        </div>

        {/* Main Viewport */}
        <div className="relative w-full h-full flex items-center justify-center transition-all duration-700">
          {call.callType === 'video' ? (
                isConnected ? (
                    <div className="w-full h-full relative group">
                        <video
                            playsInline
                            ref={userVideo}
                            autoPlay
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                        {/* Remote Video Overlay for better visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 pointer-events-none" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-12">
                        <div className="relative">
                            <div className="w-40 h-40 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl relative z-10 shadow-2xl">
                                <Video className="w-16 h-16 text-primary animate-pulse" />
                            </div>
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute inset-0 rounded-[3rem] bg-primary/30 -z-10"
                            />
                        </div>
                    </div>
                )
          ) : (
            <div className="flex flex-col items-center gap-12">
                <div className="relative">
                    <div className="w-40 h-40 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl relative z-10 shadow-2xl">
                        <Mic className="w-16 h-16 text-primary animate-pulse" />
                    </div>
                    {isCalling && (
                        <motion.div 
                            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2.5 }}
                            className="absolute inset-0 rounded-[3rem] bg-primary/20 -z-10"
                        />
                    )}
                </div>
            </div>
          )}

          {/* Local Video - Floating Window */}
          {call.callType === 'video' && stream && (
            <motion.div 
                layout
                drag
                dragConstraints={{ left: -300, right: 300, top: -400, bottom: 400 }}
                className="absolute top-32 right-8 w-48 h-64 bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl z-50 group cursor-move"
            >
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                className={`w-full h-full object-cover transition-all duration-500 ${isVideoOff ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <VideoOff className="w-10 h-10 text-white/20" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                 You
              </div>
            </motion.div>
          )}
        </div>

        {/* Controls Panel */}
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-16 left-0 right-0 z-50 flex flex-col items-center gap-10 px-4"
        >
          {!isEnded && (
            <div className="flex gap-8 items-center bg-white/5 border border-white/10 backdrop-blur-2xl px-10 py-6 rounded-[3rem] shadow-2xl">
                <Button
                    variant="ghost"
                    size="lg"
                    className={`rounded-[1.5rem] w-16 h-16 p-0 transition-all duration-300 ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'text-white/70 hover:bg-white/10'}`}
                    onClick={toggleMute}
                >
                    {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </Button>

                <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-[2rem] w-24 h-24 p-0 shadow-[0_0_50px_rgba(239,68,68,0.4)] hover:scale-110 hover:shadow-[0_0_70px_rgba(239,68,68,0.6)] transition-all active:scale-95 flex items-center justify-center p-0"
                    onClick={isCalling ? cancelCall : endCall}
                >
                    <PhoneOff className="w-10 h-10" />
                </Button>

                {call.callType === 'video' ? (
                <Button
                    variant="ghost"
                    size="lg"
                    className={`rounded-[1.5rem] w-16 h-16 p-0 transition-all duration-300 ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'text-white/70 hover:bg-white/10'}`}
                    onClick={toggleVideo}
                >
                    {isVideoOff ? <VideoOff className="w-7 h-7" /> : <Video className="w-7 h-7" />}
                </Button>
                ) : (
                    <div className="w-16" /> // Spacer for symmetry
                )}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-white/30 text-xs font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            End-to-end encrypted
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallInterface;
