import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import PaymentPage from './pages/PaymentPage';
import PlanSelectionPage from './pages/PlanSelectionPage';
import ProfilePage from './pages/ProfilePage';
import RealtimeActivity from './pages/RealtimeActivity';
import Register from './pages/Register';
import Settings from './pages/Settings';
import SubscriptionPage from './pages/SubscriptionPage';
import UserManagement from './pages/UserManagement';
import Verify from './pages/Verify';
import WatchHistoryPage from './pages/WatchHistoryPage';
import Watchlist from './pages/Watchlist';
import './main.css';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app">
          <Navbar />

          <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/plans" element={<PlanSelectionPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/history" element={<WatchHistoryPage />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/realtime" element={<RealtimeActivity />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Routes>
          </main>

          <footer className="footer" id="about">
            <p className="footer-text">
              (c) 2026 <span className="footer-brand">MOVIEX</span> - Built with React + Spring Boot
            </p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
