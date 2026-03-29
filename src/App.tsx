import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { useAuthStore } from './store/useAuthStore';
import { useCanvasSessionStore } from './store/useCanvasSessionStore';
import { MainLayout } from './components/layout/MainLayout';
import { preloadPopularFonts } from './utils/googleFonts';
import { createCanvasSession } from './services/firestoreSync';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { LauncherPage } from './pages/LauncherPage';

const CanvasView: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { setSessionId } = useCanvasSessionStore();

  useEffect(() => {
    if (sessionId) {
      setSessionId(sessionId);
    }
  }, [sessionId, setSessionId]);

  return <MainLayout />;
};

const NewCanvas: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setSessionId, setIsOwner } = useCanvasSessionStore();
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const createSession = async () => {
      if (!user) {
        console.log('No user, waiting...');
        return;
      }

      if (isCreating) {
        console.log('Already creating session...');
        return;
      }

      setIsCreating(true);
      setError(null);

      try {
        console.log('Creating canvas session for user:', user.uid);
        const newSessionId = await createCanvasSession(
          user.uid,
          user.displayName || user.email || 'Anonymous'
        );
        console.log('Session created:', newSessionId);
        setSessionId(newSessionId);
        setIsOwner(true);
        navigate(`/canvas/${newSessionId}`, { replace: true });
      } catch (err: any) {
        console.error('Failed to create session:', err);
        setError(err.message || 'Failed to create canvas session');
        setIsCreating(false);
      }
    };

    createSession();
  }, [user, navigate, setSessionId, setIsOwner]);

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-50 gap-4">
        <div className="text-lg text-red-600">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-lg text-neutral-600">Creating canvas...</div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();

  // Preload Google Fonts
  useEffect(() => {
    preloadPopularFonts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark">
        <div className="text-lg text-accent animate-pulse">Loading Studio...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/launcher" 
          element={user ? <LauncherPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/studio" 
          element={user ? <NewCanvas /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/canvas/:sessionId" 
          element={user ? <CanvasView /> : <Navigate to="/login" replace />} 
        />
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
