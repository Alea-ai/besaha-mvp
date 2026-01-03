
import React, { useState } from 'react';
import { ChatRoom } from '../components/ChatRoom';
import { Hash, MessageCircle, Shield, Heart, Map } from 'lucide-react';

export const Chat: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<string>('general');

  const channels = [
    { id: 'general', label: 'Global Souk', desc: 'General chat & introductions', icon: <MessageCircle size={18} /> },
    { id: 'gems', label: 'Hidden Gems', desc: 'Share secret spots & tips', icon: <Map size={18} /> },
    { id: 'safety', label: 'Safety & Scams', desc: 'Warnings & travel advice', icon: <Shield size={18} /> },
    { id: 'foodies', label: 'Food Lovers', desc: 'Best dishes to try', icon: <Heart size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg text-majorelle-600">
            <MessageCircle size={32} />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Community Souk</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Connect with fellow travelers and locals in real-time. Share verified tips, warn others, and discover authentic Morocco.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 space-y-6">
          
          <div>
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-4 pl-2">Topics</h3>
              <div className="space-y-2">
                {channels.map(ch => (
                    <button 
                        key={ch.id}
                        onClick={() => setActiveChannel(ch.id)}
                        className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-200 flex items-start group ${
                            activeChannel === ch.id 
                            ? 'bg-white shadow-md border-l-4 border-majorelle-600 ring-1 ring-black/5' 
                            : 'hover:bg-white hover:shadow-sm text-slate-600'
                        }`}
                    >
                        <span className={`mt-0.5 mr-3 ${activeChannel === ch.id ? 'text-majorelle-600' : 'text-slate-400 group-hover:text-majorelle-500'}`}>
                            {ch.icon}
                        </span>
                        <div>
                            <div className={`font-bold ${activeChannel === ch.id ? 'text-slate-900' : 'text-slate-700'}`}>{ch.label}</div>
                            <div className="text-xs text-slate-400 font-normal mt-0.5">{ch.desc}</div>
                        </div>
                    </button>
                ))}
              </div>
          </div>

          <div className="bg-sand-50 p-5 rounded-xl border border-sand-200">
             <h4 className="font-bold text-slate-800 mb-2 text-sm">Community Guidelines</h4>
             <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                 <li>Be kind and hospitable.</li>
                 <li>Verify information before posting warnings.</li>
                 <li>Respect local culture and traditions.</li>
                 <li>No hate speech or spam.</li>
             </ul>
          </div>

        </div>
        
        <div className="md:col-span-9">
          <ChatRoom channel={activeChannel} />
        </div>
      </div>
    </div>
  );
};
