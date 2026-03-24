import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { authHeaders } from '../utils/api';

function ProfilePage() {
  const { user, getToken } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        const headers = authHeaders(getToken());
        const [subscriptionRes, watchlistRes, historyRes] = await Promise.all([
          axios.get('/api/subscription', { headers }),
          axios.get('/api/watchlist', { headers }),
          axios.get('/api/history', { headers }),
        ]);

        setSubscription(subscriptionRes.data || null);
        setWatchlist(Array.isArray(watchlistRes.data) ? watchlistRes.data : []);
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      } catch (error) {
        console.error('Profile data fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [getToken]);

  const username = user?.username || user?.email?.split('@')?.[0] || 'User';

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '96px',
        paddingBottom: '56px',
        background:
          'radial-gradient(circle at top left, rgba(229, 9, 20, 0.14), transparent 30%), linear-gradient(180deg, #09090f 0%, #11111a 100%)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px' }}>
            Profile
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, marginTop: '8px' }}>
            Manage your Moviex account
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px', maxWidth: '720px' }}>
            Everything is shown on one page: account info, subscription status, saved movies, watch history, and settings.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          <section className="account-panel">
            <div className="panel-header">
              <h3 className="panel-title">User Info</h3>
              <span className="status-pill status-active">Account</span>
            </div>
            <div className="account-grid">
              <div>
                <span className="label-text">Username</span>
                <p className="value-text">{username}</p>
              </div>
              <div>
                <span className="label-text">Email</span>
                <p className="value-text">{user?.email || '-'}</p>
              </div>
            </div>
          </section>

          <section className="account-panel">
            <div className="panel-header">
              <h3 className="panel-title">Subscription</h3>
              <span className={`status-pill ${subscription?.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                {subscription?.status || 'INACTIVE'}
              </span>
            </div>

            {loading ? (
              <p className="muted-text">Loading subscription...</p>
            ) : (
              <div className="account-grid">
                <div>
                  <span className="label-text">Plan</span>
                  <p className="value-text">{subscription?.type || 'NONE'}</p>
                </div>
                <div>
                  <span className="label-text">Status</span>
                  <p className="value-text">{subscription?.status || 'INACTIVE'}</p>
                </div>
                <div>
                  <span className="label-text">Start Date</span>
                  <p className="value-text">{subscription?.startDate || '-'}</p>
                </div>
                <div>
                  <span className="label-text">End Date</span>
                  <p className="value-text">{subscription?.endDate || '-'}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          <section className="account-panel">
            <div className="panel-header">
              <h3 className="panel-title">Watchlist</h3>
              <span className="status-pill status-active">{watchlist.length} saved</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <p className="muted-text">Loading watchlist...</p>
              ) : watchlist.length > 0 ? (
                watchlist.map((movie) => (
                  <div key={movie.id || movie.title} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontWeight: 700 }}>{movie.title || movie.movieTitle || 'Untitled movie'}</p>
                  </div>
                ))
              ) : (
                <p className="muted-text">No saved movies yet.</p>
              )}
            </div>
          </section>

          <section className="account-panel">
            <div className="panel-header">
              <h3 className="panel-title">History</h3>
              <span className="status-pill status-active">{history.length} items</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <p className="muted-text">Loading history...</p>
              ) : history.length > 0 ? (
                history.map((item) => (
                  <div key={`${item.movieId}-${item.updatedAt}`} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontWeight: 700 }}>{item.movieTitle || item.title || 'Unknown movie'}</p>
                    <p className="muted-text" style={{ marginTop: '4px' }}>
                      Watch time: {item.watchTime ?? '-'} min
                    </p>
                  </div>
                ))
              ) : (
                <p className="muted-text">No watch history yet.</p>
              )}
            </div>
          </section>
        </div>

        <section className="account-panel" style={{ marginTop: '20px' }}>
          <div className="panel-header">
            <h3 className="panel-title">Settings</h3>
            <span className="status-pill status-active">UI only</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <label className="field-row switch-row" style={{ margin: 0 }}>
              <span>Dark Mode</span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
            </label>

            <label className="field-row" style={{ margin: 0 }}>
              <span>Language</span>
              <select
                className="field-control"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
                <option value="ja">Japanese</option>
              </select>
            </label>

            <div>
              <span className="label-text">Current Mode</span>
              <p className="value-text">{darkMode ? 'Dark' : 'Light'}</p>
            </div>

            <div>
              <span className="label-text">Selected Language</span>
              <p className="value-text">{language}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
