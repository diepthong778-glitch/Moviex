import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const WATCH_PROGRESS_KEY = 'moviex.watch.progress';

const readProgressMap = () => {
  const raw = localStorage.getItem(WATCH_PROGRESS_KEY);
  if (!raw || raw === 'undefined' || raw === 'null') return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const writeProgressMap = (map) => {
  localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(map));
};

function MoviePlayer({ movie, onClose, moviesQueue = [], onPlayMovie, onProgress }) {
  const videoRef = useRef(null);
  const [resumeText, setResumeText] = useState('');
  const [subtitleEnabled, setSubtitleEnabled] = useState(
    () => localStorage.getItem('moviex.subtitle.enabled') !== 'false'
  );
  const [subtitleLanguage, setSubtitleLanguage] = useState(
    () => localStorage.getItem('moviex.language') || 'en'
  );

  const currentIndex = moviesQueue.findIndex((item) => item.id === movie.id);
  const nextMovie = currentIndex >= 0 ? moviesQueue[currentIndex + 1] : null;
  const upNextList = moviesQueue.slice(Math.max(currentIndex, 0), Math.max(currentIndex, 0) + 6);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let lastSyncAt = 0;
    let lastServerSyncAt = 0;

    const persistProgress = (force = false) => {
      if (!Number.isFinite(video.currentTime) || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      const now = Date.now();
      if (!force && now - lastSyncAt < 4000) return;
      lastSyncAt = now;

      const payload = {
        currentTime: Math.floor(video.currentTime),
        duration: Math.floor(video.duration),
        updatedAt: now,
      };

      const nextMap = {
        ...readProgressMap(),
        [movie.id]: payload,
      };
      writeProgressMap(nextMap);
      if (onProgress) onProgress(movie.id, payload);

      if (force || now - lastServerSyncAt >= 10000) {
        lastServerSyncAt = now;
        axios.post('/api/history/save', {
          movieId: movie.id,
          movieTitle: movie.title,
          progress: payload.currentTime,
        }).catch(() => {});
      }
    };

    const handleLoadedMetadata = () => {
      const saved = readProgressMap()[movie.id];
      if (!saved || !saved.currentTime || !saved.duration) {
        setResumeText('');
        return;
      }

      if (saved.currentTime > 20 && saved.currentTime < video.duration - 10) {
        video.currentTime = saved.currentTime;
        setResumeText(`Resumed at ${Math.floor(saved.currentTime)}s`);
      } else {
        setResumeText('');
      }
    };

    const handleTimeUpdate = () => persistProgress(false);
    const handlePause = () => persistProgress(true);
    const handleEnded = () => {
      persistProgress(true);
      if (nextMovie && onPlayMovie) {
        onPlayMovie(nextMovie);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [movie.id, nextMovie, onPlayMovie, onProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.textTracks) return;

    const tracks = Array.from(video.textTracks);
    if (!tracks.length) return;

    tracks.forEach((track) => {
      const sameLanguage = !track.language || track.language === subtitleLanguage;
      track.mode = subtitleEnabled && sameLanguage ? 'showing' : 'disabled';
    });
  }, [subtitleEnabled, subtitleLanguage, movie.id]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const toggleSubtitles = () => {
    setSubtitleEnabled((current) => {
      const next = !current;
      localStorage.setItem('moviex.subtitle.enabled', String(next));
      return next;
    });
  };

  const handleLanguageChange = (event) => {
    const value = event.target.value;
    setSubtitleLanguage(value);
    localStorage.setItem('moviex.language', value);
  };

  return (
    <div className="player-modal-overlay" id="movie-player-modal" onClick={handleOverlayClick}>
      <div className="player-modal player-layout">
        <div className="player-main">
          <div className="player-modal-header">
            <div>
              <h2 className="player-modal-title">{movie.title}</h2>
              {resumeText && <p className="player-resume">{resumeText}</p>}
            </div>
            <button className="player-close-btn" onClick={onClose} aria-label="Close player">
              x
            </button>
          </div>

          <div className="player-video-container">
            <video ref={videoRef} src={movie.videoUrl} controls autoPlay playsInline>
              {movie.subtitleUrl && (
                <track
                  kind="subtitles"
                  src={movie.subtitleUrl}
                  srcLang={subtitleLanguage}
                  label={`${subtitleLanguage.toUpperCase()} Subtitle`}
                  default={subtitleEnabled}
                />
              )}
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="player-modal-info">
            <span className="movie-card-genre">{movie.genre}</span>
            <span className="movie-card-year">{movie.year}</span>
            <button className="btn btn-outline player-subtitle-btn" onClick={toggleSubtitles}>
              {subtitleEnabled ? 'Subtitles: ON' : 'Subtitles: OFF'}
            </button>
            <select
              className="field-control player-language-select"
              value={subtitleLanguage}
              onChange={handleLanguageChange}
              aria-label="Subtitle language"
            >
              <option value="en">EN</option>
              <option value="vi">VI</option>
              <option value="ja">JA</option>
            </select>
            {nextMovie && onPlayMovie && (
              <button className="btn btn-outline player-next-btn" onClick={() => onPlayMovie(nextMovie)}>
                Next: {nextMovie.title}
              </button>
            )}
          </div>
        </div>

        <aside className="player-side-panel">
          <h3 className="player-side-title">Up Next</h3>
          <div className="player-next-list">
            {upNextList.map((item) => (
              <button
                key={item.id}
                className={`player-next-item ${item.id === movie.id ? 'active' : ''}`}
                onClick={() => onPlayMovie && onPlayMovie(item)}
              >
                <span className="player-next-name">{item.title}</span>
                <span className="player-next-meta">
                  {item.genre} | {item.year}
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MoviePlayer;
