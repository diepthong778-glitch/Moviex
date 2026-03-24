import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, checkRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo">MOVIEX</span>
      </Link>
      <ul className="navbar-nav">
        <li><Link to="/">Home</Link></li>
        {user ? (
          <>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/subscription">Subscription</Link></li>
            <li><Link to="/watchlist">Watchlist</Link></li>
            <li><Link to="/history">History</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            {checkRole('ROLE_ADMIN') && (
              <>
                <li><Link to="/admin/dashboard" style={{ color: 'var(--accent-secondary)' }}>Admin Dashboard</Link></li>
                <li><Link to="/admin" style={{ color: 'var(--accent-secondary)' }}>Admin Config</Link></li>
              </>
            )}
            <li>
              <a href="#" onClick={handleLogout} style={{ fontWeight: 600 }}>
                Log Out
              </a>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/plans">Plans</Link></li>
            <li><Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px' }}>Log In</Link></li>
            <li><Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
