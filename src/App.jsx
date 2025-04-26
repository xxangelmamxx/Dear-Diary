// src/App.jsx
import { useState, useRef, useEffect, useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { AuthContext } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Home from './components/Home';
import MyPosts from './components/MyPosts';
import CreatePost from './components/CreatePost';
import PostPage from './components/PostPage';
import EditPost from './components/EditPost';

export default function App() {
  const { currentUser, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // If not logged in, only show /login
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logged-in view
  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/my-posts">My Posts</NavLink>
          <NavLink to="/create">New Post</NavLink>
        </div>

        <div className="navbar-right" ref={menuRef}>
          <button
            className="user-icon-button"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="User menu"
          >
            <User size={24} />
          </button>
          {menuOpen && (
            <div className="user-menu">
              <div className="user-email">{currentUser.email}</div>
              <button onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={<PrivateRoute><Home /></PrivateRoute>}
          />
          <Route
            path="/my-posts"
            element={<PrivateRoute><MyPosts /></PrivateRoute>}
          />
          <Route
            path="/create"
            element={<PrivateRoute><CreatePost /></PrivateRoute>}
          />
          <Route
            path="/posts/:id"
            element={<PrivateRoute><PostPage /></PrivateRoute>}
          />
          <Route
            path="/posts/:id/edit"
            element={<PrivateRoute><EditPost /></PrivateRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
