
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, Map, MessageCircle, LogIn, Hexagon } from 'lucide-react';
import { subscribeToAuth, logout } from '../services/mockService';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
      const unsubscribe = subscribeToAuth((u) => setUser(u));
      return () => unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path 
    ? "text-majorelle-700 font-bold bg-majorelle-50 px-3 py-1 rounded-full ring-1 ring-majorelle-100" 
    : "text-slate-600 hover:text-majorelle-700 px-3 py-1 transition-colors duration-200";

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zellij flex flex-col font-body">
      <nav className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-sand-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-majorelle-700 to-majorelle-900 rounded-lg flex items-center justify-center mr-3 shadow-lg group-hover:rotate-6 transition-transform duration-300 ring-2 ring-white ring-offset-2 ring-offset-sand-50">
                  <Hexagon size={20} className="text-white fill-current opacity-90" />
                </div>
                <div className="flex flex-col">
                    <span className="font-display font-bold text-2xl text-slate-900 tracking-wide leading-none group-hover:text-majorelle-800 transition-colors">Besaha</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-terracotta-600 font-bold mt-1">Authentic Morocco</span>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link to="/" className={isActive('/')}>Discover</Link>
              <Link to="/chat" className={isActive('/chat')}>Community Chat</Link>
              
              {user ? (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                   <Link to="/profile" className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all ${location.pathname === '/profile' ? 'bg-sand-100 ring-1 ring-terracotta-200' : 'hover:bg-gray-50'}`}>
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" />
                      <span className="font-bold text-sm text-slate-700">{user.name}</span>
                   </Link>
                   <button onClick={handleLogout} className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors">Log out</button>
                </div>
              ) : (
                <Link to="/login" className="ml-4 bg-majorelle-700 text-white px-6 py-2.5 rounded-full hover:bg-majorelle-800 transition-all shadow-md hover:shadow-lg hover:shadow-majorelle-700/30 flex items-center font-bold text-sm">
                  <LogIn size={16} className="mr-2" /> Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 hover:text-majorelle-600 focus:outline-none p-2">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl animate-slide-up">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" className="block px-4 py-3 rounded-lg text-base font-bold text-slate-700 hover:bg-sand-100 hover:text-majorelle-700" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center"><Map size={20} className="mr-3 text-terracotta-500"/> Discover</div>
              </Link>
              <Link to="/chat" className="block px-4 py-3 rounded-lg text-base font-bold text-slate-700 hover:bg-sand-100 hover:text-majorelle-700" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center"><MessageCircle size={20} className="mr-3 text-terracotta-500"/> Community Chat</div>
              </Link>
              {user ? (
                <>
                  <Link to="/profile" className="block px-4 py-3 rounded-lg text-base font-bold text-slate-700 hover:bg-sand-100 hover:text-majorelle-700" onClick={() => setIsMenuOpen(false)}>
                    <div className="flex items-center"><UserIcon size={20} className="mr-3 text-terracotta-500"/> My Profile</div>
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-lg text-base font-bold text-red-500 hover:bg-red-50">
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/login" className="block px-4 py-3 rounded-lg text-base font-bold text-majorelle-600 bg-majorelle-50 mt-4 text-center" onClick={() => setIsMenuOpen(false)}>
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      <main className="flex-grow relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sand-100 to-transparent opacity-60 z-0 pointer-events-none"></div>
        <div className="relative z-10 h-full">{children}</div>
      </main>
      <footer className="bg-slate-900 text-slate-300 py-12 border-t-4 border-majorelle-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/moroccan-flower.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
           <div className="flex justify-center mb-6">
             <div className="p-3 bg-slate-800 rounded-xl">
                <Hexagon className="text-terracotta-500 fill-current opacity-80 animate-pulse-slow" />
             </div>
           </div>
          <p className="font-display font-bold text-2xl text-sand-100 tracking-wide">Besaha</p>
          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-center items-center gap-4 text-xs font-mono text-slate-600">
            <span>&copy; 2025 Besaha Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
