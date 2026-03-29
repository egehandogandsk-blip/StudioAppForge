import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuthStore } from '../store/useAuthStore';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  // If already authenticated, redirect to launcher
  if (user) {
    return <Navigate to="/launcher" replace />;
  }

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      navigate('/launcher');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDevMode = () => {
    const mockUser = {
      uid: 'dev-user-' + Date.now(),
      email: 'dev@localhost',
      displayName: 'Developer',
      photoURL: null,
    } as any;
    setUser(mockUser);
    navigate('/launcher');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for manual email auth
    setError('Manual email setup is pending. Please use Developer Login for now.');
  };

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-darkAccent/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home Link */}
        <button 
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm transition-colors"
        >
          ← Back to Home
        </button>

        <div className="glass-panel p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30 shadow-glow mx-auto mb-4">
              <span className="text-accent text-2xl font-bold">F</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? 'Welcome back to Flippy' : 'Create your account'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Enter your details to access the studio.' : 'Sign up to start designing.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-darkAccent border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent transition-colors"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full bg-darkAccent border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full bg-darkAccent border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full glow-button py-2.5 mt-2"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="relative flex items-center py-4 mb-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase tracking-wider">or continue with</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              type="button"
              className="w-full glass-button py-2.5 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? 'Connecting...' : 'Google'}
            </button>

            <button
              onClick={handleDevMode}
              type="button"
              className="w-full py-2.5 flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg transition-all text-sm font-medium"
            >
              Developer Login (Bypass)
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? (
              <p>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-accent hover:underline">Sign up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setIsLogin(true)} className="text-accent hover:underline">Sign in</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
