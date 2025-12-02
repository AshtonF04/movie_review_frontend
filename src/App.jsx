import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './index.css'
import { useAuth } from './AuthContext.jsx'

const TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMTdkNjFhMjUyYmUwMzE4OGVmNDdlY2ZjN2NiMGIwMSIsIm5iZiI6MTc2NDI2NDcwMy44NTUsInN1YiI6IjY5Mjg4YWZmMDEyMWU0YmNiNTI0OTAzYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.pKVgISg9jQY2fCF490-wS-4Q_QC26rgC_6dBsuCW24Y'

const IMG_URL = 'https://image.tmdb.org/t/p/w500'

function Layout({ children }) {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tv" element={<TvShows />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      {children}
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div id="hero">
      {user && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          color: '#111',
        }}>
          <span style={{ fontWeight: 'bold' }}>User: {user.username}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      )}
      <h1 id="hero-title">LetterBox Light</h1>
      <div className="button-container">
        <button id="start-btn" onClick={() => navigate('/movies')}>
          Get Started
        </button>
        <button id="login-email" onClick={() => navigate('/login')}>
          Login with Email
        </button>
        <button id="register" onClick={() => navigate('/register')}>
          Sign Up
        </button>
      </div>
    </div>
  )
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div id="navbar">
      <div id="logo">LetterBox Light</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link id="movies-btn" to="/movies">
          Movies
        </Link>{' '}
        |{' '}
        <Link id="tv-btn" to="/tv">
          TV Shows
        </Link>{' '}
        |{' '}
        <Link id="back-btn" to="/">
          HOME
        </Link>
        {user && (
          <>
            <span style={{ marginLeft: '10px', color: '#f5c518' }}>
              User: {user.username}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}


function Movies() {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [allMovies, setAllMovies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadMovies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onScroll() {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      if (bottom && !loading) {
        loadMovies()
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, page, allMovies])

  async function loadMovies() {
    if (loading) return
    setLoading(true)
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?page=${page}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + TOKEN,
        },
      },
    )
    const data = await res.json()
    setAllMovies((prev) => [...prev, ...data.results])
    setPage((p) => p + 1)
    setLoading(false)
  }

  const filtered = allMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <Navbar />
      <div id="search-section">
        <input
          id="search"
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div id="movies">
        {filtered
          .filter((m) => m.poster_path)
          .map((movie) => (
            <img
              key={movie.id}
              src={IMG_URL + movie.poster_path}
              alt={movie.title}
              className="movie-poster"
              onClick={() => navigate(`/movie/${movie.id}`)}
            />
          ))}
      </div>
    </>
  )
}

function TvShows() {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [allShows, setAllShows] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadShows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onScroll() {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      if (bottom && !loading) {
        loadShows()
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, page, allShows])

  async function loadShows() {
    if (loading) return
    setLoading(true)
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/popular?page=${page}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + TOKEN,
        },
      },
    )
    const data = await res.json()
    setAllShows((prev) => [...prev, ...data.results])
    setPage((p) => p + 1)
    setLoading(false)
  }

  const filtered = allShows.filter((show) =>
    (show.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <Navbar />
      <div id="search-section">
        <input
          id="search"
          type="text"
          placeholder="Search TV shows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div id="shows">
        {filtered
          .filter((s) => s.poster_path)
          .map((show) => (
            <img
              key={show.id}
              src={IMG_URL + show.poster_path}
              alt={show.name}
            />
          ))}
      </div>
    </>
  )
}

function MovieDetail() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [cast, setCast] = useState([])
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState('details')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const [detailsRes, creditsRes, reviewsRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${id}`, {
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer ' + TOKEN,
          },
        }),
        fetch(`https://api.themoviedb.org/3/movie/${id}/credits`, {
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer ' + TOKEN,
          },
        }),
        fetch(`https://api.themoviedb.org/3/movie/${id}/reviews`, {
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer ' + TOKEN,
          },
        }),
      ])
      const details = await detailsRes.json()
      const credits = await creditsRes.json()
      const reviewData = await reviewsRes.json()

      setMovie(details)
      setCast(credits.cast?.slice(0, 12) || [])
      setReviews(
        reviewData.results && reviewData.results.length
          ? reviewData.results
          : [
              {
                id: 'no-review',
                author: 'No reviews available',
                content:
                  'Be the first to write a review for this movie!',
                author_details: { avatar_path: null, rating: null },
              },
            ],
      )
    }
    fetchData()
  }, [id])

  function avatarUrl(review) {
    const avatarPath = review.author_details?.avatar_path
    if (!avatarPath) {
      return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    }
    if (avatarPath.startsWith('/https://') || avatarPath.startsWith('/http://')) {
      return avatarPath.slice(1)
    }
    return 'https://image.tmdb.org/t/p/w200' + avatarPath
  }

  function nextReview() {
    setCurrentIndex((i) => (i + 1) % reviews.length)
  }

  function prevReview() {
    setCurrentIndex((i) => (i - 1 + reviews.length) % reviews.length)
  }

  if (!movie) {
    return (
      <>
        <Navbar />
        <p style={{ padding: 20 }}>Loading...</p>
      </>
    )
  }

  const currentReview = reviews[currentIndex]

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="movie-poster">
          <div className="hover-3d">
            <figure>
              <img
                id="moviePoster"
                src={IMG_URL + movie.poster_path}
                alt={movie.title}
              />
            </figure>
          </div>
        </div>
        <div className="movie-details">
          <h1 className="movie-title">{movie.title}</h1>
          <p className="movie-tagline">{movie.tagline}</p>
          <div className="tabs">
            <div
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </div>
            <div
              className={`tab ${activeTab === 'cast' ? 'active' : ''}`}
              onClick={() => setActiveTab('cast')}
            >
              Cast
            </div>
            <div
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </div>
          </div>

          {activeTab === 'details' && (
            <div className="tab-content active">
              <div className="movie-info">
                <p>{movie.overview}</p>
                <p>
                  <strong>Release Date:</strong> {movie.release_date}
                </p>
                <p>
                  <strong>Runtime:</strong> {movie.runtime} min
                </p>
                <p>
                  <strong>Rating:</strong> {movie.vote_average}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cast' && (
            <div className="tab-content active">
              <div className="cast-list">
                {cast.map((actor) => (
                  <div key={actor.id} className="cast-member">
                    {actor.profile_path && (
                      <img
                        src={IMG_URL + actor.profile_path}
                        alt={actor.name}
                      />
                    )}
                    <p>{actor.name}</p>
                    <p
                      style={{
                        color: '#a0a0a0',
                        fontSize: '0.9em',
                      }}
                    >
                      {actor.character}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-content active">
              <div className="carousel-wrapper">
                <div className="carousel-track">
                  <div className="carousel-slide">
                    <div className="review-card">
                      <div className="avatar">
                        <img
                          src={avatarUrl(currentReview)}
                          alt="User Avatar"
                        />
                      </div>
                      <div className="review-content">
                        <div className="username">
                          {currentReview.author}
                        </div>
                        <div className="rating">
                          {currentReview.author_details?.rating
                            ? `⭐ ${currentReview.author_details.rating}/10`
                            : '⭐ N/A'}
                        </div>
                        <div className="content">
                          {currentReview.content || 'No content available.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button id="prevBtn" onClick={prevReview}>
                  ❮
                </button>
                <button id="nextBtn" onClick={nextReview}>
                  ❯
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/movies')
    } else {
      setError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="auth-page">
      {user && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          color: '#111',
        }}>
          <span style={{ fontWeight: 'bold' }}>User: {user.username}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      )}
      <div className="auth-container">
        <h2>Login</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <Link className="auth-link" to="/register">
          Don't have an account? Sign Up
        </Link>
      </div>
    </div>
  )
}

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await register(username, email, password)
    
    if (result.success) {
      navigate('/movies')
    } else {
      setError(result.error || 'Registration failed')
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="auth-page">
      {user && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          color: '#111',
        }}>
          <span style={{ fontWeight: 'bold' }}>User: {user.username}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      )}
      <div className="auth-container">
        <h2>Sign Up</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <Link className="auth-link" to="/login">
          Already have an account? Login
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tv" element={<TvShows />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App
