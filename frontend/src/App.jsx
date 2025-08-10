import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import CreativePlayground from './pages/CreativePlayground';
import CalendarPage from './pages/CalendarPage';

function App() {
    return (
        <ThemeProvider>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/play" element={<CreativePlayground />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FaqPage />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;