import { Routes, Route, Link, useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './index.css'
import { useAuth } from './AuthContext.jsx'

const TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMTdkNjFhMjUyYmUwMzE4OGVmNDdlY2ZjN2NiMGIwMSIsIm5iZiI6MTc2NDI2NDcwMy44NTUsInN1YiI6IjY5Mjg4YWZmMDEyMWU0YmNiNTI0OTAzYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.pKVgISg9jQY2fCF490-wS-4Q_QC26rgC_6dBsuCW24Y'

const IMG_URL = 'https://image.tmdb.org/t/p/w500'

function HomeRedirect() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
  }
  
  if (user) {
    return <Navigate to="/movies" replace />
  } else {
    return <Navigate to="/login" replace />
  }
}

function Layout({ children }) {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:id" element={<UserProfileWrapper />} />
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
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  // Sync search term with URL params
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
  }, [searchParams])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignUp = () => {
    navigate('/register')
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchTerm.trim())}`)
    } else {
      navigate('/movies')
    }
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e)
    }
  }

  return (
    <div id="navbar">
      <div id="logo">LetterBox Light</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'flex-end' }}>
        <form onSubmit={handleSearchSubmit} className="navbar-search-form">
          <input
            id="navbar-search"
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
          />
        </form>
        {user ? (
          <>
            <Link id="movies-btn" to="/movies">
              Movies
            </Link>
            |{' '}
            <Link id="profile-btn" to="/profile">
              {user.username}
            </Link>
            <button
              onClick={handleLogout}
              className="navbar-btn navbar-btn-logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link id="movies-btn" to="/movies">
              Movies
            </Link>
            <button
              onClick={handleLogin}
              className="navbar-btn navbar-btn-login"
            >
              Login
            </button>
            <button
              onClick={handleSignUp}
              className="navbar-btn navbar-btn-signup"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  )
}


function Movies() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Reset when search query changes
    setMovies([])
    setPage(1)
    setHasMore(true)
    loadMovies(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  useEffect(() => {
    function onScroll() {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      if (bottom && !loading && hasMore) {
        loadMovies(false)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore])

  async function loadMovies(reset = false) {
    if (loading) return
    setLoading(true)
    
    try {
      let url
      if (searchQuery.trim()) {
        // Use search API
        url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&page=${reset ? 1 : page}&include_adult=false`
      } else {
        // Use discover API for popular movies
        url = `https://api.themoviedb.org/3/discover/movie?page=${reset ? 1 : page}`
      }

      const res = await fetch(url, {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + TOKEN,
        },
      })
      
      const data = await res.json()
      
      if (reset) {
        setMovies(data.results || [])
        setPage(2)
      } else {
        setMovies((prev) => [...prev, ...(data.results || [])])
        setPage((p) => p + 1)
      }
      
      // Check if there are more pages
      setHasMore(data.page < data.total_pages)
    } catch (error) {
      console.error('Error loading movies:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div id="movies">
        {movies
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
        {loading && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#a0a0a0' }}>
            Loading...
          </p>
        )}
        {!loading && movies.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#a0a0a0' }}>
            {searchQuery ? `No movies found for "${searchQuery}"` : 'No movies found'}
          </p>
        )}
      </div>
    </>
  )
}

function MovieDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [cast, setCast] = useState([])
  const [reviews, setReviews] = useState([])
  const [activeTab, setActiveTab] = useState('details')
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [deletingReviewId, setDeletingReviewId] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const [detailsRes, creditsRes] = await Promise.all([
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
      ])
      const details = await detailsRes.json()
      const credits = await creditsRes.json()

      setMovie(details)
      setCast(credits.cast?.slice(0, 12) || [])
    }
    fetchData()
  }, [id])

  const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${id}`)
      if (response.ok) {
        const reviewData = await response.json()
        setReviews(reviewData)
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setLoadingReviews(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab])

  // Find user's review
  const userReview = user ? reviews.find(review => review.user_id === user.id) : null

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')

    if (!user) {
      setReviewError('You must be logged in to leave a review')
      return
    }

    if (!comment.trim()) {
      setReviewError('Comment is required')
      return
    }

    if (!rating || rating === '') {
      setReviewError('Rating is required')
      return
    }

    const ratingNum = parseInt(rating, 10)
    const ratingFloat = parseFloat(rating)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10 || ratingNum !== ratingFloat) {
      setReviewError('Rating must be an integer between 1 and 10')
      return
    }

    if (comment.length > 200) {
      setReviewError('Comment must be 200 characters or less')
      return
    }

    setSubmittingReview(true)
    try {
      const url = isEditing 
        ? `http://localhost:3000/api/reviews/${editingReviewId}`
        : 'http://localhost:3000/api/reviews'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          movie_id: parseInt(id),
          rating: ratingNum,
          comment: comment.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setReviewError(data.error || `Failed to ${isEditing ? 'update' : 'submit'} review`)
        return
      }

      // Reset form
      setComment('')
      setRating('')
      setReviewError('')
      setIsEditing(false)
      setEditingReviewId(null)
      
      // Refresh reviews list
      await fetchReviews()
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'submitting'} review:`, error)
      setReviewError(`Failed to ${isEditing ? 'update' : 'submit'} review. Please try again.`)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleEditReview = () => {
    if (userReview) {
      setIsEditing(true)
      setEditingReviewId(userReview.id)
      setRating(userReview.rating.toString())
      setComment(userReview.comment || '')
      setReviewError('')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingReviewId(null)
    setRating('')
    setComment('')
    setReviewError('')
  }

  const handleDeleteReview = async () => {
    if (!userReview || !user) {
      return
    }

    if (!window.confirm('Are you sure you want to delete your review?')) {
      return
    }

    setDeletingReviewId(userReview.id)
    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${userReview.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setReviewError(data.error || 'Failed to delete review')
        return
      }

      // Refresh reviews list
      await fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      setReviewError('Failed to delete review. Please try again.')
    } finally {
      setDeletingReviewId(null)
    }
  }

  if (!movie) {
    return (
      <>
        <Navbar />
        <p style={{ padding: 20 }}>Loading...</p>
      </>
    )
  }

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
              {/* Review Form or Your Review Section */}
              {user ? (
                userReview && !isEditing ? (
                  // Show user's review with edit/delete options
                  <div className="your-review-container">
                    <h3 style={{ marginBottom: '15px', color: '#f5c518' }}>Your Review</h3>
                    <div className="review-item your-review-item">
                      <div className="review-header">
                        <div className="review-username">{userReview.username}</div>
                        <div className="review-rating">
                          ⭐ {userReview.rating}/10
                        </div>
                      </div>
                      <div className="review-comment">
                        {userReview.comment || 'No comment provided.'}
                      </div>
                      {userReview.created_at && (
                        <div className="review-date">
                          {new Date(userReview.created_at).toLocaleDateString()}
                        </div>
                      )}
                      <div className="review-actions">
                        <button
                          onClick={handleEditReview}
                          className="edit-review-btn"
                          disabled={deletingReviewId === userReview.id}
                        >
                          Edit Review
                        </button>
                        <button
                          onClick={handleDeleteReview}
                          className="delete-review-btn"
                          disabled={deletingReviewId === userReview.id}
                        >
                          {deletingReviewId === userReview.id ? 'Deleting...' : 'Delete Review'}
                        </button>
                      </div>
                    </div>
                    {reviewError && (
                      <div className="review-error" style={{ marginTop: '15px' }}>{reviewError}</div>
                    )}
                  </div>
                ) : (
                  // Show form (either creating new or editing)
                  <div className="review-form-container">
                    <h3 style={{ marginBottom: '15px', color: '#f5c518' }}>
                      {isEditing ? 'Edit Your Review' : 'Leave a Review'}
                    </h3>
                    <form onSubmit={handleSubmitReview} className="review-form">
                      <div className="form-group">
                        <label htmlFor="rating">Rating (1-10)</label>
                        <input
                          id="rating"
                          type="number"
                          min="1"
                          max="10"
                          step="1"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          placeholder="Enter rating (1-10)"
                          required
                          disabled={submittingReview}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="comment">Comment</label>
                        <textarea
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Write your review (max 200 characters)"
                          rows="4"
                          maxLength={200}
                          required
                          disabled={submittingReview}
                        />
                        <div className="char-count">
                          {comment.length}/200 characters
                        </div>
                      </div>
                      {reviewError && (
                        <div className="review-error">{reviewError}</div>
                      )}
                      <div className="form-actions">
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="submit-review-btn"
                        >
                          {submittingReview 
                            ? (isEditing ? 'Updating...' : 'Submitting...') 
                            : (isEditing ? 'Update Review' : 'Submit Review')}
                        </button>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={submittingReview}
                            className="cancel-review-btn"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )
              ) : (
                <div className="review-login-prompt">
                  <p>Please <Link to="/login" style={{ color: '#f5c518' }}>login</Link> to leave a review.</p>
                        </div>
              )}

              {/* Reviews List */}
              {loadingReviews ? (
                <p style={{ padding: 20 }}>Loading reviews...</p>
              ) : (() => {
                // Filter out user's review from the list (it's shown in "Your Review" section)
                const otherReviews = user && userReview 
                  ? reviews.filter(review => review.id !== userReview.id)
                  : reviews
                
                if (otherReviews.length === 0) {
                  return (
                    <p style={{ padding: 20, color: '#a0a0a0', marginTop: '20px' }}>
                      {user && userReview 
                        ? 'No other reviews yet.' 
                        : 'No reviews yet. Be the first to review this movie!'}
                    </p>
                  )
                }
                
                return (
                  <div className="reviews-list">
                    <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#f5c518' }}>
                      {user && userReview ? 'Other Reviews' : 'Reviews'} ({otherReviews.length})
                    </h3>
                    {otherReviews.map((review) => (
                      <div 
                        key={review.id} 
                        className="review-item review-item-clickable"
                        onClick={() => navigate(`/user/${review.user_id}`)}
                      >
                        <div className="review-header">
                          <div className="review-username">{review.username}</div>
                          <div className="review-rating">
                            ⭐ {review.rating}/10
                          </div>
                        </div>
                        <div className="review-comment">
                          {review.comment || 'No comment provided.'}
                        </div>
                        {review.created_at && (
                          <div className="review-date">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}
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
  const { login } = useAuth()
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

  return (
    <>
      <Navbar />
      <div className="auth-page-dark">
        <div className="auth-container-dark">
          <h2 className="auth-title">Login</h2>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <Link className="auth-link-dark" to="/register">
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </>
  )
}

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
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

  return (
    <>
      <Navbar />
      <div className="auth-page-dark">
        <div className="auth-container-dark">
          <h2 className="auth-title">Sign Up</h2>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <Link className="auth-link-dark" to="/login">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </>
  )
}

function UserProfile({ userId }) {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [movieDetails, setMovieDetails] = useState({})

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch user info
        const userResponse = await fetch(`http://localhost:3000/api/users/${userId}`)
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUserInfo(userData)
        }

        // Fetch user reviews
        const reviewsResponse = await fetch(`http://localhost:3000/api/reviews/user/${userId}`)
        if (reviewsResponse.ok) {
          const reviewData = await reviewsResponse.json()
          setReviews(reviewData)
          
          // Fetch movie details for each review
          const movieIds = [...new Set(reviewData.map(r => r.movie_id))]
          const detailsPromises = movieIds.map(async (movieId) => {
            try {
              const movieRes = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}`,
                {
                  headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + TOKEN,
                  },
                }
              )
              if (movieRes.ok) {
                const movieData = await movieRes.json()
                return { [movieId]: movieData }
              }
            } catch (error) {
              console.error(`Error fetching movie ${movieId}:`, error)
            }
            return {}
          })
          
          const detailsArray = await Promise.all(detailsPromises)
          const detailsObj = Object.assign({}, ...detailsArray)
          setMovieDetails(detailsObj)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <p style={{ padding: 20, color: '#a0a0a0', textAlign: 'center' }}>Loading...</p>
        </div>
      </>
    )
  }

  if (!userInfo) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <p style={{ padding: 20, color: '#a0a0a0', textAlign: 'center' }}>User not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-username">{userInfo.username}</h1>
          <p className="profile-email">{userInfo.email}</p>
          {userInfo.created_at && (
            <p className="profile-join-date">
              Joined: {formatDate(userInfo.created_at)}
            </p>
          )}
        </div>
        
        <div className="profile-reviews-section">
          <h2 className="profile-reviews-title">
            Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p style={{ padding: 20, color: '#a0a0a0' }}>
              This user hasn't left any reviews yet.
            </p>
          ) : (
            <div className="profile-reviews-list">
              {reviews.map((review) => {
                const movie = movieDetails[review.movie_id]
                return (
                  <div 
                    key={review.id} 
                    className="profile-review-item"
                    onClick={() => navigate(`/movie/${review.movie_id}`)}
                  >
                    <div className="profile-review-movie">
                      <h3 className="profile-review-movie-title">
                        {movie ? movie.title : `Movie ID: ${review.movie_id}`}
                      </h3>
                      {movie && movie.release_date && (
                        <p className="profile-review-movie-year">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      )}
                    </div>
                    <div className="profile-review-content">
                      <div className="profile-review-rating">
                        ⭐ {review.rating}/10
                      </div>
                      {review.comment && (
                        <p className="profile-review-comment">{review.comment}</p>
                      )}
                      <p className="profile-review-date">
                        Reviewed on {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [movieDetails, setMovieDetails] = useState({})

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    async function fetchUserReviews() {
      try {
        const response = await fetch(`http://localhost:3000/api/reviews/user/${user.id}`)
        if (response.ok) {
          const reviewData = await response.json()
          setReviews(reviewData)
          
          // Fetch movie details for each review
          const movieIds = [...new Set(reviewData.map(r => r.movie_id))]
          const detailsPromises = movieIds.map(async (movieId) => {
            try {
              const movieRes = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}`,
                {
                  headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + TOKEN,
                  },
                }
              )
              if (movieRes.ok) {
                const movieData = await movieRes.json()
                return { [movieId]: movieData }
              }
            } catch (error) {
              console.error(`Error fetching movie ${movieId}:`, error)
            }
            return {}
          })
          
          const detailsArray = await Promise.all(detailsPromises)
          const detailsObj = Object.assign({}, ...detailsArray)
          setMovieDetails(detailsObj)
        }
      } catch (error) {
        console.error('Error fetching user reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserReviews()
  }, [user, navigate])

  if (!user) {
    return null
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-username">{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          {user.created_at && (
            <p className="profile-join-date">
              Joined: {formatDate(user.created_at)}
            </p>
          )}
        </div>
        
        <div className="profile-reviews-section">
          <h2 className="profile-reviews-title">
            My Reviews ({reviews.length})
          </h2>
          {loading ? (
            <p style={{ padding: 20, color: '#a0a0a0' }}>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p style={{ padding: 20, color: '#a0a0a0' }}>
              You haven't left any reviews yet.
            </p>
          ) : (
            <div className="profile-reviews-list">
              {reviews.map((review) => {
                const movie = movieDetails[review.movie_id]
                return (
                  <div 
                    key={review.id} 
                    className="profile-review-item"
                    onClick={() => navigate(`/movie/${review.movie_id}`)}
                  >
                    <div className="profile-review-movie">
                      <h3 className="profile-review-movie-title">
                        {movie ? movie.title : `Movie ID: ${review.movie_id}`}
                      </h3>
                      {movie && movie.release_date && (
                        <p className="profile-review-movie-year">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      )}
                    </div>
                    <div className="profile-review-content">
                      <div className="profile-review-rating">
                        ⭐ {review.rating}/10
                      </div>
                      {review.comment && (
                        <p className="profile-review-comment">{review.comment}</p>
                      )}
                      <p className="profile-review-date">
                        Reviewed on {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function UserProfileWrapper() {
  const { id } = useParams()
  return <UserProfile userId={id} />
}

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:id" element={<UserProfileWrapper />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App
