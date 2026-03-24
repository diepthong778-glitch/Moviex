import axios from 'axios';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authHeaders } from '../utils/api';

function MovieDetailModal({ movie, onClose, onPlay }) {
  const { getToken, user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const quickEpisodes = Array.from({ length: 6 }, (_, index) => ({
    id: `${movie.id}-e${index + 1}`,
    title: `Episode ${index + 1}`,
    duration: `${45 + index} min`,
  }));

  const addToWatchlist = async () => {
    if (!user) {
      setMessage('Login required to save watchlist.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      await axios.post(
        '/api/watchlist/add',
        { movieId: movie.id },
        { headers: authHeaders(getToken()) }
      );
      setMessage('Added to watchlist.');
    } catch {
      setMessage('Could not add to watchlist.');
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="detail-modal-overlay" onClick={handleOverlayClick}>
      <article className="detail-modal">
        <header className="detail-header">
          <div>
            <h2 className="detail-title">{movie.title}</h2>
            <p className="detail-meta">
              {movie.genre} | {movie.year} | {movie.requiredSubscription}
            </p>
          </div>
          <button className="player-close-btn" onClick={onClose} aria-label="Close details">
            x
          </button>
        </header>

        <div className="detail-actions">
          <button className="btn btn-primary" onClick={onPlay}>
            Play Now
          </button>
          <button className="btn btn-outline" onClick={addToWatchlist} disabled={saving}>
            {saving ? 'Saving...' : 'Add to Watchlist'}
          </button>
        </div>

        <p className="detail-description">
          {movie.description || 'No synopsis available for this title yet.'}
        </p>

        <section>
          <h3 className="player-side-title">Episode List</h3>
          <div className="detail-episode-list">
            {quickEpisodes.map((episode) => (
              <button key={episode.id} className="player-next-item" onClick={onPlay}>
                <span className="player-next-name">{episode.title}</span>
                <span className="player-next-meta">{episode.duration}</span>
              </button>
            ))}
          </div>
        </section>

        {message && <p className="muted-text">{message}</p>}
      </article>
    </div>
  );
}

export default MovieDetailModal;
