import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import ColorSchemeSelector from '../components/ColorSchemeSelector';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error("Error during login:", err);
            setError("Invalid email or password.");
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user document already exists in Firestore
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // If it doesn't exist, create it
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    createdAt: serverTimestamp(),
                    compassGoals: {
                        goal1: 'Define your first long-term goal.',
                        goal2: 'Define your second long-term goal.',
                        goal3: 'Define your third long-term goal.',
                    },
                });
            }
            navigate('/dashboard');
        } catch (err) {
            console.error("Error during Google login:", err);

            // Special handling for unauthorized domain error
            if (err.code === 'auth/unauthorized-domain') {
                setError("This domain is not authorized for authentication. You need to add your domain (localhost) to the authorized domains in your Firebase console. Go to Authentication > Settings > Authorized domains.");

                // For development, you can also use email/password login instead
                console.log("Try using email/password login instead during development.");
            } else {
                setError(err.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md card-modern animate-scale-in">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-white text-center mb-1">👋 Welcome Back!</h1>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <ColorSchemeSelector />
                        </div>
                    </div>
                    <p className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ready to crush your goals today?</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
                            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-modern w-full"
                                placeholder="your.email@example.com"
                            />
                        </div>
                        <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                            <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-modern w-full"
                                placeholder="Your secret code"
                            />
                        </div>

                        {error && <p className="text-red-300 text-sm bg-red-500 bg-opacity-20 p-2 rounded-lg animate-fade-in">{error}</p>}

                        <button
                            type="submit"
                            className="btn-primary w-full animate-slide-in"
                            style={{ animationDelay: '0.3s' }}
                        >
                            Let's Go! ⚡
                        </button>
                    </form>

                    <div className="relative my-6 animate-slide-in" style={{ animationDelay: '0.4s' }}>
                        <div className="absolute inset-0 flex items-center">
                            <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className={`px-2 ${isDark ? 'text-gray-400 bg-gray-900' : 'text-gray-500 bg-gray-50'}`}>or</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className={`w-full flex justify-center items-center py-3 px-4 ${isDark ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-300 hover:bg-gray-50'} border rounded-xl text-white font-medium transition duration-200 animate-slide-in`}
                        style={{ animationDelay: '0.5s' }}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.405,44,30.631,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        Continue with Google
                    </button>

                    <div className="mt-6 text-center animate-slide-in" style={{ animationDelay: '0.6s' }}>
                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Don't have an account yet?{" "}
                            <Link to="/signup" className="text-indigo-400 font-medium hover:underline">
                                Sign up now
                            </Link>
                        </p>
                    </div>
                </div>

                <div className={`p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        MindShift - where productivity meets your vibe 🔥
                    </p>
                </div>
            </div>
        </div>
    );
}
