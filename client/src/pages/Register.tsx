import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.ts';
import Icon from '../components/Icon.tsx';
import './Login.css';

const BULLETS = [
  { icon: 'vaccines', text: 'Vaccine & medication reminders, automatically scheduled' },
  { icon: 'health_and_safety', text: 'AI symptom check for quick peace of mind' },
  { icon: 'ios_share', text: 'Share a read-only record with any vet in one link' },
];

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch {
      setError('Could not create account. Try a different email.');
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
          <h2 className="auth-form-title">reate your account</h2>
          <p className="muted auth-form-subtitle">
            Start your pet’s health record.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dana K." required />
            </div>
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
              Create account
            </button>
          </form>

          <div className="row gap-sm muted divider-row">
            <span className="grow divider-line" />
            or
            <span className="grow divider-line" />
          </div>

          <button className="btn btn-outline auth-submit auth-google" onClick={handleGoogle} disabled={busy}>
            <Icon name="login" size={19} />
            Continue with Google
          </button>

          <p className="muted login-footer">
            Already have an account?
            <span className="link-text" onClick={() => navigate('/login')}>
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
