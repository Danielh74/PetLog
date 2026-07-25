import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import Icon from '../components/Icon.tsx';

const Login = () => {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);
      navigate('/dashboard');
    } catch {
      setError(isRegister ? 'Could not create account. Try a different email.' : 'Invalid email or password.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setBusy(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page login-page">
        <div className="avatar login-avatar">
          <Icon name="pets" size={36} filled />
        </div>
        <h1 className="login-title">{isRegister ? 'Create your account' : 'Welcome to PetLog'}</h1>
        <p className="muted login-subtitle">Every vaccine, vet visit &amp; reminder — in one calm place.</p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dana K." required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field login-field-tight">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {isRegister ? 'Create account' : 'Log in'}
          </button>
        </form>

        <div className="row gap-sm muted divider-row">
          <span className="grow divider-line" />
          or
          <span className="grow divider-line" />
        </div>

        <button className="btn btn-outline" onClick={handleGoogle} disabled={busy}>
          <Icon name="login" size={20} />
          Continue with Google
        </button>

        <p className="muted login-footer">
          {isRegister ? 'Already have an account? ' : 'New here? '}
          <span className="link-text" onClick={() => setIsRegister((v) => !v)}>
            {isRegister ? 'Log in' : 'Create an account'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
