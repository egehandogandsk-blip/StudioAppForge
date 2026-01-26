import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginScreen: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const setUser = useAuthStore((state) => state.setUser);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Failed to sign in');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-indigo-600 mb-2">Studio Forge</h1>
                    <p className="text-neutral-600">Professional vector design tool</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-neutral-200 hover:border-indigo-500 hover:bg-indigo-50 text-neutral-700 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {loading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <p className="text-xs text-neutral-500 text-center mt-6">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};
