import React from 'react';
import { useCall } from '../../contexts/CallContext';
import { Phone, Video, PhoneOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

const IncomingCall = () => {
  const { call, answerCall, rejectCall } = useCall();

  const isRinging = call.status === 'ringing';
  const showUI = call.status !== 'idle' && call.isReceivingCall && call.status !== 'connected';

  if (!showUI) return null;

  const getStatusText = () => {
    switch (call.status) {
      case 'ringing': return `Incoming ${call.callType} call...`;
      case 'rejected': return 'Call rejected';
      case 'cancelled': return 'Call cancelled';
      case 'ended': return 'Call ended';
      default: return '';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 30, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4"
      >
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-8 flex flex-col items-center gap-6 overflow-hidden">
          {/* Animated Background Ring */}
          {isRinging && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent " />
          )}

          <div className="relative">
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-inner ${
                isRinging ? 'bg-primary/10 animate-pulse ring-8 ring-primary/5' : 'bg-red-500/10'
            }`}>
              {call.callType === 'video' ? (
                <Video className={`w-10 h-10 ${isRinging ? 'text-primary' : 'text-red-500 text-muted-foreground' }`} />
              ) : (
                <Phone className={`w-10 h-10 ${isRinging ? 'text-primary' : 'text-red-500 text-muted-foreground' }`} />
              )}
            </div>
            {isRinging && (
                 <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-[2rem] bg-primary/20 -z-10"
                 />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-foreground">{call.name || 'Care Provider'}</h3>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block ${
                isRinging ? 'bg-primary/10 text-primary animate-pulse' : 'bg-red-500/10 text-red-500'
            }`}>
              {getStatusText()}
            </p>
          </div>

          {isRinging && (
            <div className="flex gap-6 w-full justify-center mt-2 px-4">
                <Button 
                    variant="destructive" 
                    size="lg" 
                    className="rounded-[1.5rem] w-full h-14 p-0 shadow-lg hover:scale-105 transition-transform active:scale-95"
                    onClick={rejectCall}
                >
                <PhoneOff className="w-6 h-6 mr-2" /> Decline
                </Button>
                <Button 
                    variant="default" 
                    size="lg" 
                    className="rounded-[1.5rem] w-full h-14 p-0 bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:scale-105 transition-transform active:scale-95"
                    onClick={answerCall}
                >
                <Check className="w-6 h-6 mr-2" /> Accept
                </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCall;
