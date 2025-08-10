import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import ColorSchemeSelector from '../components/ColorSchemeSelector';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const handleSignup = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Create user in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                createdAt: serverTimestamp(),
                compassGoals: {
                    goal1: 'Define your first long-term goal.',
                    goal2: 'Define your second long-term goal.',
                    goal3: 'Define your third long-term goal.',
                },
                hasCompletedOnboarding: false, // Set to false to show onboarding flow
            });

            // Redirect to dashboard
            navigate('/dashboard');

        } catch (err) {
            console.error("Error during signup:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 animate-slide-in">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="text-4xl sm:text-5xl animate-float">🧠</div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">
                            MindShift
                        </h1>
                    </div>
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Trade mindless scrolling for meaningful progress ✨</p>
                </div>

                {/* Signup Card */}
                <div className="card-modern animate-scale-in">
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-center">
                                <div className="text-4xl mb-2 animate-float">✨</div>
                                <h2 className="text-2xl font-bold text-white mb-2">Join MindShift</h2>
                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Level up your productivity game</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <ColorSchemeSelector />
                            </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
                                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Email</label>
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
                                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input-modern w-full"
                                    placeholder="Make it strong! 💪"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 p-3 rounded-xl animate-fade-in">
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full animate-slide-in"
                                style={{ animationDelay: '0.3s' }}
                            >
                                {loading ? 'Creating Account... ✨' : 'Create My Account 🚀'}
                            </button>
                        </form>

                        <div className="mt-6 text-center animate-slide-in" style={{ animationDelay: '0.4s' }}>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Already have an account?{" "}
                                <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors duration-200">
                                    Login here ✨
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className={`p-4 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            By signing up, you're joining thousands of GenZ productivity hackers 🧠✨
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
