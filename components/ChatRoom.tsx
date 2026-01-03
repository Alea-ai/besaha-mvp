
import React, { useEffect, useState, useRef } from 'react';
import { Send, User as UserIcon, Hash, MessageCircle, ShieldCheck, Lightbulb, AlertTriangle, HelpCircle } from 'lucide-react';
import { ChatMessage, User, MessageType } from '../types';
import { subscribeToChat, sendMessage, subscribeToAuth } from '../services/mockService';

interface Props {
  channel: string;
}

export const ChatRoom: React.FC<Props> = ({ channel }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const unsubAuth = subscribeToAuth(setUser);
      return () => unsubAuth();
  }, []);

  // Scroll to bottom only when a new message arrives (based on count or ID change)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.id]);

  // Subscribe to Chat updates
  useEffect(() => {
    setMessages([]); // Clear messages when channel changes
    const unsubscribe = subscribeToChat(channel, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [channel]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText;
    const type = messageType;
    setInputText(''); 
    setMessageType('text'); // Reset to default
    setIsSending(true);

    try {
        await sendMessage(channel, text, type);
    } catch (err) {
        console.error("Failed to send", err);
        setInputText(text); 
    } finally {
        setIsSending(false);
    }
  };

  const getMessageStyle = (type: MessageType, isMe: boolean) => {
      if (isMe) return 'bg-majorelle-600 text-white rounded-br-none';
      
      switch(type) {
          case 'warning':
              return 'bg-red-50 text-red-900 border border-red-200 rounded-bl-none';
          case 'tip':
              return 'bg-gold-50 text-amber-900 border border-gold-200 rounded-bl-none';
          case 'question':
              return 'bg-blue-50 text-blue-900 border border-blue-200 rounded-bl-none';
          default:
              return 'bg-white text-slate-700 border border-gray-100 rounded-bl-none';
      }
  };

  const getTypeIcon = (type: MessageType) => {
      switch(type) {
          case 'warning': return <AlertTriangle size={14} className="text-red-500" />;
          case 'tip': return <Lightbulb size={14} className="text-gold-500" />;
          case 'question': return <HelpCircle size={14} className="text-blue-500" />;
          default: return null;
      }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-white/50 overflow-hidden glass-panel">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-majorelle-800 to-majorelle-600 text-white p-5 shadow-md flex items-center justify-between">
        <div>
            <div className="flex items-center gap-2">
                <Hash size={20} className="opacity-75" />
                <h3 className="font-display font-bold text-xl tracking-wide capitalize">{channel}</h3>
            </div>
            <p className="text-xs text-majorelle-200 mt-1 pl-7">Community discussion for {channel}</p>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div> Live
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-6 overflow-y-auto bg-sand-50 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
             <MessageCircle size={48} className="text-terracotta-300 mb-2" />
             <p className="text-slate-400 font-display">The souk is quiet.<br/>Be the first to share a story!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user?.id === msg.userId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}>
                <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                    {/* Avatar */}
                    {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0 shadow-sm mb-1 font-bold text-xs text-slate-600 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">{msg.userName.charAt(0)}</div>
                    </div>
                    )}
                    
                    {/* Bubble */}
                    <div className={`
                        p-3.5 rounded-2xl shadow-sm text-sm relative
                        ${getMessageStyle(msg.type, isMe)}
                    `}>
                        {!isMe && (
                          <div className="flex items-center gap-1 mb-1">
                             <span className="text-[10px] font-bold text-terracotta-600 uppercase tracking-wider">{msg.userName}</span>
                             {msg.badges?.local && <span className="bg-terracotta-100 text-terracotta-700 text-[9px] px-1 rounded border border-terracotta-200">LOCAL</span>}
                             {msg.badges?.communityTrusted && <ShieldCheck size={10} className="text-majorelle-600" />}
                          </div>
                        )}
                        
                        {/* Message Type Indicator */}
                        {!isMe && msg.type !== 'text' && (
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">
                                {getTypeIcon(msg.type)}
                                <span>{msg.type}</span>
                            </div>
                        )}

                        <p className="leading-relaxed">{msg.text}</p>
                        <div className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-majorelle-100' : 'text-slate-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4">
          {/* Message Type Selector */}
          {user && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                <button 
                    onClick={() => setMessageType('text')}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${messageType === 'text' ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-300' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Message
                </button>
                <button 
                    onClick={() => setMessageType('tip')}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${messageType === 'tip' ? 'bg-gold-100 text-gold-800 ring-1 ring-gold-300' : 'text-slate-500 hover:bg-gold-50'}`}
                >
                    <Lightbulb size={12} /> Share Tip
                </button>
                <button 
                    onClick={() => setMessageType('warning')}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${messageType === 'warning' ? 'bg-red-100 text-red-800 ring-1 ring-red-300' : 'text-slate-500 hover:bg-red-50'}`}
                >
                    <AlertTriangle size={12} /> Warning
                </button>
                <button 
                    onClick={() => setMessageType('question')}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${messageType === 'question' ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300' : 'text-slate-500 hover:bg-blue-50'}`}
                >
                    <HelpCircle size={12} /> Question
                </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={user ? `Share a ${messageType} in #${channel}...` : "Log in to join the conversation"}
            disabled={!user || isSending}
            className="flex-grow px-5 py-3 bg-slate-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-majorelle-500 focus:bg-white transition-all text-sm"
            />
            <button
            type="submit"
            disabled={!user || !inputText.trim() || isSending}
            className="bg-terracotta-600 text-white p-3 rounded-full hover:bg-terracotta-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all hover:rotate-12"
            >
            <Send size={20} className={isSending ? 'opacity-50' : ''} />
            </button>
          </form>
      </div>
    </div>
  );
};
