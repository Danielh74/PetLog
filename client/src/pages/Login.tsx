import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import Icon from '../components/Icon.tsx';
import './Login.css';

const BULLETS = [
  { icon: 'vaccines', text: 'Vaccine & medication reminders, automatically scheduled' },
  { icon: 'health_and_safety', text: 'AI symptom check for quick peace of mind' },
  { icon: 'ios_share', text: 'Share a read-only record with any vet in one link' },
];

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
    <div className="auth-wrap">
      <div className="auth-brand">
        <div className="row gap-sm auth-brand-logo">
          <span className="auth-logo-mark">
            <Icon name="pets" size={20} filled />
          </span>
          <span className="auth-wordmark">PetLog</span>
        </div>
        <h1 className="auth-headline">Every vaccine, vet visit &amp; reminder — in one calm place.</h1>
        <p className="auth-subtext">
          Built for the whole life of your pet: health records, care plans, and an AI symptom check when
          something feels off.
        </p>
        <div className="stack gap-md auth-bullets">
          {BULLETS.map((b) => (
            <div key={b.icon} className="row gap-md auth-bullet">
              <span className="auth-bullet-icon">
                <Icon name={b.icon} size={18} />
              </span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-col">
          <h2 className="auth-form-title">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          <p className="muted auth-form-subtitle">
            {isRegister ? 'Start your pet’s health record.' : "Log in to see your pets' latest records."}
          </p>

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

            <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
              {isRegister ? 'Create account' : 'Log in'}
            </button>
          </form>

          <div className="row gap-sm muted divider-row">
            <span className="grow divider-line" />
            or
            <span className="grow divider-line" />
          </div>

          <button className="btn btn-outline auth-submit" onClick={handleGoogle} disabled={busy}>
            <Icon name="login" size={19} />
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
    </div>
  );
};

export default Login;
