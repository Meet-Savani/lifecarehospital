import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { 
  MessageSquare, User, Search, 
  Send, Image as ImageIcon, FileText, 
  Video, MoreVertical, Phone, Video as VideoIcon,
  ChevronLeft, Loader2, CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5000", {
  transports: ["websocket"],
  autoConnect: true
});

export default function ConsultationChats() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [search, setSearch] = useState("");
  const scrollRef = useRef();

  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ["my-consultation-chats", user?._id],
    queryFn: async () => {
      const response = await api.get("/chat/my-chats");
      return response.data || [];
    },
  });

  const { data: initialMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["chat-messages", selectedChat?._id],
    queryFn: async () => {
      const response = await api.get(`/chat/messages/${selectedChat._id}`);
      return response.data;
    },
    enabled: !!selectedChat?._id,
  });

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!selectedChat?._id) return;
    socket.emit("join_chat", selectedChat._id);
    const onMsg = (newMsg) => {
      if (newMsg.chatId === selectedChat._id) {
        setMessages(prev => [...prev, newMsg]);
      }
    };
    socket.on("receive_message", onMsg);
    return () => socket.off("receive_message", onMsg);
  }, [selectedChat?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !selectedChat) return;
    try {
      const res = await api.post("/chat/messages", { 
        chatId: selectedChat._id, 
        message: msgInput, 
        type: "text" 
      });
      socket.emit("send_message", { ...res.data, chatId: selectedChat._id });
      setMessages(prev => [...prev, res.data]);
      setMsgInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredChats = chats?.filter(chat => {
    const other = chat.participants.find(p => p._id !== user?._id);
    return other?.fullName?.toLowerCase().includes(search.toLowerCase());
  });

  const getOtherParticipant = (chat) => chat?.participants.find(p => p._id !== user?._id);

  return (
    <DashboardLayout role={user?.role}>
      <div className="max-w-[1400px] mx-auto h-[calc(100vh-120px)] bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex">
        
        {/* Left Sidebar - Chat List (Instagram style) */}
        <aside className={`w-full md:w-[400px] border-r border-slate-50 flex flex-col bg-slate-50/30 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 space-y-6">
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h2>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Clinical Discussions</p>
             </div>
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input 
                  placeholder="Search interactions..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 pl-12 rounded-2xl border-none bg-white shadow-sm focus:ring-primary/20 font-bold text-sm"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-8">
             {chatsLoading ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
               </div>
             ) : filteredChats?.length === 0 ? (
               <div className="text-center py-20">
                  <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Channels</p>
               </div>
             ) : (
               filteredChats.map((chat) => {
                 const other = getOtherParticipant(chat);
                 const isActive = selectedChat?._id === chat._id;
                 return (
                   <motion.div 
                     key={chat._id}
                     onClick={() => setSelectedChat(chat)}
                     whileHover={{ x: 5 }}
                     className={`p-5 rounded-[2rem] cursor-pointer transition-all flex items-center gap-4 ${
                       isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-transparent hover:bg-white text-slate-600'
                     }`}
                   >
                     <div className="relative">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${
                         isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                       }`}>
                         {other?.fullName?.charAt(0)}
                       </div>
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-0.5">
                          <p className="font-black text-sm truncate">{other?.fullName}</p>
                          <span className={`text-[9px] font-bold uppercase opacity-50 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                            {chat.lastMessage ? format(new Date(chat.updatedAt), 'hh:mm a') : ''}
                          </span>
                       </div>
                       <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                         {chat.lastMessage?.message || 'Started a new session'}
                       </p>
                     </div>
                   </motion.div>
                 );
               })
             )}
          </div>
        </aside>

        {/* Right Section - Active Chat */}
        <main className={`flex-1 flex flex-col bg-white ${!selectedChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {!selectedChat ? (
            <div className="text-center space-y-6 max-w-sm px-10">
               <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                  <MessageSquare className="w-10 h-10 text-slate-200" />
               </div>
               <div>
                 <h3 className="text-2xl font-black text-slate-900">Secure Protocol</h3>
                 <p className="text-slate-400 text-sm font-medium mt-2 leading-relaxed">
                   Select a clinical interaction from the left sidebar to begin end-to-end encrypted synchronization.
                 </p>
               </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <header className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50">
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setSelectedChat(null)}>
                       <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                       {getOtherParticipant(selectedChat)?.fullName?.charAt(0)}
                    </div>
                    <div>
                       <h4 className="font-black text-slate-900 leading-none">{getOtherParticipant(selectedChat)?.fullName}</h4>
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Secure Session
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:bg-slate-50"><Phone className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:bg-slate-50"><VideoIcon className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:bg-slate-50"><MoreVertical className="w-5 h-5" /></Button>
                 </div>
              </header>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 scrollbar-hide">
                 {messages.map((m, i) => {
                   const isMe = m.senderId === user?._id;
                   return (
                     <motion.div 
                       key={m._id || i}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                     >
                        <div className={`max-w-[70%] p-4 md:p-5 rounded-[2rem] shadow-sm ${
                          isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
                        }`}>
                           {m.type === 'text' && <p className="text-sm md:text-base font-medium leading-relaxed">{m.message}</p>}
                           {m.type === 'image' && <img src={m.fileUrl} className="max-w-full rounded-2xl shadow-lg border-4 border-white/5 active:scale-95 transition-transform" />}
                           {/* Add more type rendering if needed */}
                           <span className={`text-[9px] font-black uppercase tracking-widest mt-3 block opacity-40 ${isMe ? 'text-right' : 'text-left'}`}>
                             {format(new Date(m.createdAt), 'hh:mm a')}
                           </span>
                        </div>
                     </motion.div>
                   );
                 })}
                 <div ref={scrollRef} />
              </div>

              {/* Input Area */}
              <footer className="p-6 md:p-8 bg-white border-t border-slate-50">
                <form onSubmit={onSend} className="flex gap-4">
                   <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all hidden md:flex">
                        <FileText className="w-5 h-5" />
                      </Button>
                   </div>
                   <Input 
                    placeholder="Type clinical synchronization..." 
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    className="h-14 flex-1 rounded-2xl border-none bg-slate-50 font-bold px-6 shadow-inner focus-visible:ring-primary/20"
                   />
                   <Button type="submit" className="h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all">
                      <Send className="w-6 h-6" />
                   </Button>
                </form>
              </footer>
            </>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
