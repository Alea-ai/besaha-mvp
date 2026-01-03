
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/mockService';
import { LogIn, Hexagon, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Mock: Password ignored
  const [name, setName] = useState('');
  const [isLocal, setIsLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        containerRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
        containerRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email);
      } else {
        await register(email, name, isLocal);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden group">
      <div className="cursor-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/50 relative z-10 animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-majorelle-500 via-majorelle-700 to-majorelle-900"></div>
        
        <div className="text-center mb-8 mt-4">
             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-majorelle-50 to-white rounded-2xl mb-4 text-majorelle-700 shadow-inner border border-majorelle-100">
                 <Hexagon size={32} strokeWidth={1.5} />
             </div>
            <h2 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Besaha</h2>
            <p className="text-slate-500 mt-2 font-light">{isLogin ? "Welcome Back" : "Join the Community"}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3 bg-sand-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-majorelle-600 focus:outline-none"
                placeholder="Full Name"
              />
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl bg-sand-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isLocal} 
                  onChange={(e) => setIsLocal(e.target.checked)} 
                  className="w-5 h-5 text-majorelle-600 rounded focus:ring-majorelle-500" 
                />
                <span className="text-sm font-bold text-slate-700">I am a local Moroccan resident</span>
              </label>
            </>
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 bg-sand-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-majorelle-600 focus:outline-none"
            placeholder="Email Address"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 bg-sand-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-majorelle-600 focus:outline-none"
            placeholder="Password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-majorelle-700 to-majorelle-800 text-white py-4 rounded-xl font-bold hover:from-majorelle-800 hover:to-majorelle-900 transition-all shadow-lg hover:shadow-majorelle-600/30 disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? 'Processing...' : (isLogin ? <><LogIn size={20} className="mr-2" /> Sign In</> : <><UserPlus size={20} className="mr-2" /> Create Account</>)}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-majorelle-600 font-bold hover:underline text-sm">
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};
