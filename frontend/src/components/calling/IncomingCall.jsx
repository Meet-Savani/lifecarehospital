import React from 'react';
import { useCall } from '../../contexts/CallContext';
import { Phone, Video, PhoneOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

const IncomingCall = () => {
  const { call, answerCall, rejectCall } = useCall();

  if (!call.isReceivingCall || call.status !== 'ringing') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 20 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4"
      >
        <div className="bg-card text-card-foreground border shadow-2xl rounded-2xl p-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            {call.callType === 'video' ? (
              <Video className="w-8 h-8 text-primary" />
            ) : (
              <Phone className="w-8 h-8 text-primary" />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold">{call.name}</h3>
            <p className="text-muted-foreground text-sm uppercase tracking-wider mt-1">
              Incoming {call.callType} call...
            </p>
          </div>

          <div className="flex gap-4 w-full justify-center mt-2">
            <Button 
                variant="destructive" 
                size="lg" 
                className="rounded-full w-14 h-14 p-0 shadow-lg"
                onClick={rejectCall}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button 
                variant="default" 
                size="lg" 
                className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600 shadow-lg"
                onClick={answerCall}
            >
              <Check className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCall;
