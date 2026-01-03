
import React, { useEffect, useState, useRef } from 'react';
import { subscribeToAuth, updateProfile } from '../services/mockService';
import { User } from '../types';
import { Navigate } from 'react-router-dom';
import { Camera, MapPin, Award, Lock, Edit2, Check, X as XIcon } from 'lucide-react';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const unsubscribe = subscribeToAuth((u) => {
          setUser(u);
          if (u) {
            setEditName(u.name);
            setPreviewUrl(u.avatar || null);
          }
          setLoading(false);
      });
      return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setEditAvatar(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user || !editName.trim()) return;
    setIsSaving(true);
    try {
        await updateProfile(editName, editAvatar || undefined);
        setIsEditing(false);
        setEditAvatar(null);
    } catch (error) {
        console.error("Failed to update profile", error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(user?.name || '');
    setPreviewUrl(user?.avatar || null);
    setEditAvatar(null);
  };

  if (loading) return <div className="p-20 text-center">Loading profile...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white relative">
        {/* Header Background Pattern */}
        <div className="h-48 bg-gradient-to-r from-majorelle-600 to-majorelle-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/moroccan-flower.png')]"></div>
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
            {/* Profile Info Section */}
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 mb-8 gap-6">
                
                {/* Avatar Container */}
                <div className="relative group">
                    <img 
                      src={previewUrl || user.avatar} 
                      alt={user.name} 
                      className="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-white object-cover"
                    />
                    {isEditing && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 rounded-full cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="text-white" size={32} />
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileChange} 
                            />
                        </div>
                    )}
                </div>

                <div className="text-center md:text-left flex-grow w-full">
                  {isEditing ? (
                      <div className="space-y-2 animate-fade-in">
                          <input 
                             type="text" 
                             value={editName}
                             onChange={(e) => setEditName(e.target.value)}
                             className="text-2xl font-display font-bold text-slate-800 border-b-2 border-majorelle-500 focus:outline-none bg-transparent w-full md:w-auto"
                             placeholder="Your Name"
                          />
                      </div>
                  ) : (
                      <h1 className="text-3xl font-display font-bold text-slate-800">{user.name}</h1>
                  )}
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 mt-1 text-sm">
                      <Lock size={12} /> 
                      <span>{user.email}</span>
                      <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">Private</span>
                  </div>

                  <div className="mt-3 flex gap-2 justify-center md:justify-start">
                    {user.badges?.local && (
                        <span className="bg-terracotta-100 text-terracotta-800 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-terracotta-200">Local Resident</span>
                    )}
                    {user.badges?.traveler && (
                        <span className="bg-majorelle-50 text-majorelle-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-majorelle-200">Traveler</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                     {isEditing ? (
                         <>
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-bold transition flex items-center shadow-md"
                            >
                                {isSaving ? 'Saving...' : <><Check size={16} className="mr-1"/> Save</>}
                            </button>
                            <button 
                                onClick={handleCancel}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-bold transition flex items-center"
                            >
                                <XIcon size={16} className="mr-1"/> Cancel
                            </button>
                         </>
                     ) : (
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="px-5 py-2.5 bg-majorelle-600 hover:bg-majorelle-700 text-white rounded-full text-sm font-bold transition flex items-center shadow-md hover:shadow-lg"
                        >
                            <Edit2 size={14} className="mr-2"/> Edit Profile
                        </button>
                     )}
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="bg-sand-50 p-6 rounded-2xl border border-sand-200 text-center group hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-terracotta-400"></div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-terracotta-500 shadow-sm group-hover:scale-110 transition-transform">
                    <MapPin size={24} />
                </div>
                <div className="font-display font-bold text-3xl text-slate-800">{user.contributionsCount || 0}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Verified Visits</div>
              </div>
              
              <div className="bg-sand-50 p-6 rounded-2xl border border-sand-200 text-center group hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-majorelle-400"></div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-majorelle-600 shadow-sm group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                </div>
                <div className="font-display font-bold text-3xl text-slate-800">0</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Photos Added</div>
              </div>
              
               <div className="bg-sand-50 p-6 rounded-2xl border border-sand-200 text-center group hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold-400"></div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-gold-500 shadow-sm group-hover:scale-110 transition-transform">
                    <Award size={24} />
                </div>
                <div className="font-display font-bold text-3xl text-slate-800">{Math.floor((user.contributionsCount || 0) / 5) + 1}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Explorer Level</div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
