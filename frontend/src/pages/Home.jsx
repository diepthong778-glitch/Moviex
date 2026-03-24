import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import MovieDetailModal from '../components/MovieDetailModal';
import MoviePlayer from '../components/MoviePlayer';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/api/movies';
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

function MovieRail({ title, subtitle, movies, onSelect, watchProgress }) {
  if (!movies.length) return null;

  return (
    <section className="section rail-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="movie-rail">
        {movies.map((movie) => (
          <div className="rail-item" key={movie.id}>
            <MovieCard movie={movie} onPlay={onSelect} progress={watchProgress[movie.id]} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [detailMovie, setDetailMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchProgress, setWatchProgress] = useState({});
  const [visibleCount, setVisibleCount] = useState(24);
  const [subscription, setSubscription] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    fetchMovies();
    setWatchProgress(readProgressMap());
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        return;
      }
      try {
        const response = await axios.get('/api/subscription/me');
        setSubscription(response.data);
      } catch {
        setSubscription(null);
      }
    };

    fetchSubscription();
  }, [user]);

  const canPlanAccess = (planType, requiredSub) => {
    if (requiredSub === 'BASIC') return true;
    if (planType === 'PREMIUM') return true;
    return planType === 'STANDARD' && requiredSub === 'STANDARD';
  };

  const saveWatchStart = async (movie) => {
    if (!movie?.id) return;
    try {
      await axios.post('/api/history/save', {
        movieId: movie.id,
        movieTitle: movie.title,
        progress: 0,
      });
    } catch {
      // ignore save errors here
    }
  };

  const playMovie = (movie) => {
    if (!user) {
      navigate('/plans');
      return;
    }

    if (!subscription?.planType || subscription?.status === 'PENDING') {
      navigate('/plans');
      return;
    }

    if (subscription?.status === 'EXPIRED') {
      alert('Subscription expired');
      return;
    }

    if (!canPlanAccess(subscription.planType, movie.requiredSubscription)) {
      alert('Upgrade required');
      navigate('/plans');
      return;
    }

    saveWatchStart(movie);
    setSelectedMovie(movie);
  };

  const handleSelectMovie = (movie) => {
    setDetailMovie(movie);
  };

  const handleProgressChange = (movieId, progress) => {
    const nextMap = {
      ...readProgressMap(),
      [movieId]: progress,
    };
    writeProgressMap(nextMap);
    setWatchProgress(nextMap);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const filteredMovies = movies.filter((movie) => {
    const value = deferredSearchQuery.trim().toLowerCase();
    if (!value) return true;

    return (
      movie.title?.toLowerCase().includes(value) ||
      movie.genre?.toLowerCase().includes(value) ||
      String(movie.year ?? '').includes(value)
    );
  });

  const activeQueue = filteredMovies.length ? filteredMovies : movies;
  const featuredMovie = activeQueue[0];

  useEffect(() => {
    setVisibleCount(24);
  }, [deferredSearchQuery, movies.length]);

  useEffect(() => {
    if (loading || error) return undefined;

    const handleScroll = () => {
      if (window.innerHeight + window.scrollY < document.body.offsetHeight - 360) return;
      setVisibleCount((prev) => {
        if (prev >= activeQueue.length) return prev;
        return Math.min(prev + 12, activeQueue.length);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeQueue.length, loading, error]);

  const continueWatching = movies
    .filter((movie) => {
      const progress = watchProgress[movie.id];
      if (!progress || !progress.duration || !progress.currentTime) return false;
      return progress.currentTime > 15 && progress.currentTime < progress.duration - 15;
    })
    .sort((a, b) => {
      const aAt = watchProgress[a.id]?.updatedAt ?? 0;
      const bAt = watchProgress[b.id]?.updatedAt ?? 0;
      return bAt - aAt;
    });

  const watchedGenres = continueWatching.map((movie) => movie.genre).filter(Boolean);
  const recommended = activeQueue.filter(
    (movie) =>
      !continueWatching.some((watched) => watched.id === movie.id) &&
      (watchedGenres.length === 0 || watchedGenres.includes(movie.genre))
  );
  const premiumPicks = activeQueue.filter((movie) => movie.requiredSubscription === 'PREMIUM');
  const standardPicks = activeQueue.filter((movie) => movie.requiredSubscription === 'STANDARD');
  const freePicks = activeQueue.filter((movie) => movie.requiredSubscription === 'BASIC');
  const exploreMore = activeQueue.slice(0, visibleCount);
  const hasMore = visibleCount < activeQueue.length;

  return (
    <div style={{ paddingTop: '72px' }} className="home-shell">
      <section className="hero" id="hero">
        <div className="hero-content">
          <div className="hero-badge">Now Streaming</div>
          {featuredMovie ? (
            <>
              <h1>
                {featuredMovie.title}, <span className="gradient-text">Watch in one click</span>
              </h1>
              <p>
                {featuredMovie.genre} | {featuredMovie.year} | {featuredMovie.requiredSubscription}{' '}
                access
              </p>
            </>
          ) : (
            <>
              <h1>
                Unlimited Movies, <span className="gradient-text">Endless Entertainment</span>
              </h1>
              <p>
                Discover and stream your favorite movies in stunning quality. From blockbusters to
                indie gems, all in one place.
              </p>
            </>
          )}
          <div className="hero-actions">
            {featuredMovie && (
              <button className="btn btn-primary" onClick={() => playMovie(featuredMovie)}>
                Play Featured
              </button>
            )}
            <a href="#discover" className="btn btn-outline">
              Browse Movies
            </a>
          </div>
        </div>
      </section>

      <section className="section discover-toolbar" id="discover">
        <div className="section-header">
          <div>
            <h2 className="section-title">Discover</h2>
            <p className="section-subtitle">Hover for preview, click for full details</p>
          </div>
          <div className="search-container search-container-inline">
            <input
              type="text"
              placeholder="Search movies by title, genre, or year..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
              aria-label="Search movies"
            />
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading movies...</span>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon">!</div>
            <h3 className="error-title">Failed to load movies</h3>
            <p className="error-message">{error}</p>
            <button className="btn btn-primary" onClick={fetchMovies}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">MOVIE</div>
            <h3 className="empty-title">No movies found</h3>
          </div>
        )}

        {!loading && !error && movies.length > 0 && filteredMovies.length > 0 && (
          <>
            <MovieRail
              title="Continue Watching"
              subtitle="Resume from where you left off"
              movies={continueWatching}
              onSelect={playMovie}
              watchProgress={watchProgress}
            />

            <MovieRail
              title="Recommended For You"
              subtitle="Based on your recent watching activity"
              movies={recommended}
              onSelect={handleSelectMovie}
              watchProgress={watchProgress}
            />

            <MovieRail
              title="Premium Picks"
              subtitle="Top-tier catalog for premium members"
              movies={premiumPicks}
              onSelect={handleSelectMovie}
              watchProgress={watchProgress}
            />

            <MovieRail
              title="Standard Collection"
              subtitle="Popular movies available on standard plan"
              movies={standardPicks}
              onSelect={handleSelectMovie}
              watchProgress={watchProgress}
            />

            <MovieRail
              title="Free to Start"
              subtitle="No subscription barrier, start here"
              movies={freePicks}
              onSelect={handleSelectMovie}
              watchProgress={watchProgress}
            />

            <MovieRail
              title="Explore More"
              subtitle="Infinite feed loaded while you scroll"
              movies={exploreMore}
              onSelect={handleSelectMovie}
              watchProgress={watchProgress}
            />

            {hasMore && <p className="infinite-hint">Scroll down to load more titles...</p>}
          </>
        )}

        {!loading && !error && movies.length > 0 && filteredMovies.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">SEARCH</div>
            <h3 className="empty-title">No matching movies found</h3>
            <p className="empty-text">Try a different title, genre, or year.</p>
          </div>
        )}
      </section>

      {detailMovie && (
        <MovieDetailModal
          movie={detailMovie}
          onClose={() => setDetailMovie(null)}
          onPlay={() => {
            setDetailMovie(null);
            playMovie(detailMovie);
          }}
        />
      )}

      {selectedMovie && (
        <MoviePlayer
          movie={selectedMovie}
          moviesQueue={activeQueue}
          onClose={() => setSelectedMovie(null)}
          onPlayMovie={setSelectedMovie}
          onProgress={handleProgressChange}
        />
      )}
    </div>
  );
}

export default Home;
