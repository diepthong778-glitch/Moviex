import { useRef, useState } from 'react';

function MovieCard({ movie, onPlay, progress }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setPreviewEnabled(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handlePlay = (event) => {
    event.stopPropagation();
    onPlay(movie);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPlay(movie);
    }
  };

  const progressPercent =
    progress?.duration > 0
      ? Math.min(100, Math.floor((progress.currentTime / progress.duration) * 100))
      : 0;

  return (
    <div
      className="movie-card"
      id={`movie-card-${movie.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handlePlay}
      onKeyDown={handleKeyDown}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      role="button"
      tabIndex={0}
      data-hovered={isHovered}
      aria-label={`Open details for ${movie.title}`}
    >
      <div className="movie-card-video-wrapper">
        {previewEnabled && movie.trailerUrl ? (
          <video
            ref={videoRef}
            src={movie.trailerUrl}
            poster={movie.posterUrl || ''}
            muted
            loop
            playsInline
            preload="none"
          />
        ) : (
          <div className="movie-poster-fallback">
            <span>{movie.title}</span>
          </div>
        )}
        <div className="movie-card-overlay">
          <button className="play-btn" aria-label={`Play ${movie.title}`}>
            <svg viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-meta">
          <span className="movie-card-genre">{movie.genre}</span>
          <span className="movie-card-year">{movie.year}</span>
        </div>
        {progressPercent > 0 && (
          <div className="card-progress">
            <div className="card-progress-track">
              <div className="card-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="card-progress-label">{progressPercent}% watched</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
