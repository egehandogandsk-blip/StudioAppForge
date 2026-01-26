import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { useAuthStore } from './store/useAuthStore';
import { LoginScreen } from './components/auth/LoginScreen';
import { MainLayout } from './components/layout/MainLayout';
import { FabricCanvas } from './components/canvas/FabricCanvas';

function App() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="text-lg text-neutral-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <MainLayout>
      <FabricCanvas />
    </MainLayout>
  );
}

export default App;
