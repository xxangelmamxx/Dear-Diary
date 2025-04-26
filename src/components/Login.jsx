import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';

export default function Login() {
  const { signup, login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState('');
  const nav = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      if (isSignup) {
        const hash = await bcrypt.hash(password, 10);
        await signup(email, hash);
      } else {
        const user = await login(email);
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) throw new Error('Invalid credentials');
      }
      nav('/');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isSignup ? 'Create Account' : 'Welcome Back to the Dear Diary Project'}</h2>
        {message && <div className="error-message">{message}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="primary">
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="login-toggle">
          {isSignup
            ? 'Already have an account?'
            : "Don't have one yet?"}{' '}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage('');
            }}
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
