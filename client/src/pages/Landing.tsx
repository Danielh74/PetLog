import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import './Landing.css';

const FEATURES = [
  {
    icon: 'folder_shared',
    title: 'One health log',
    body: 'Vaccinations, visits, medications, weight and grooming -- filtered by type, never an endless scroll.',
  },
  {
    icon: 'notifications_active',
    title: 'Care that reminds you',
    body: 'Add a pet and PetLog proposes the right schedule for its species and age. Overdue never hides.',
  },
  {
    icon: 'auto_awesome',
    title: 'An honest AI check',
    body: 'Describe what you are seeing, get ranked causes and one clear verdict: wait, 48 hours, or go now.',
  },
];

const STEPS = [
  {
    n: 1,
    title: 'Add your pet',
    body: 'Name, species, breed, birthday. That is it.',
  },
  {
    n: 2,
    title: 'Accept a care plan',
    body: 'We suggest the right vaccinations and care. You toggle off anything you do not want.',
  },
  {
    n: 3,
    title: 'Share when it matters',
    body: 'One read-only link for your vet or a family member. No account needed on their side.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrap">
      <header className="landing-header">
        <div className="landing-logo">
          <span className="avatar landing-logo-icon">
            <Icon name="pets" size={20} filled />
          </span>
          <span className="landing-wordmark">PetLog</span>
        </div>
        <nav className="landing-nav" />
        <div className="landing-actions">
          <button onClick={() => navigate('/login')} className="btn-text">
            Log in
          </button>
          <button onClick={() => navigate('/pets/new')} className="btn btn-primary">
            Get started
          </button>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-left">
            <div className="landing-chip">
              <Icon name="auto_awesome" size={18} />
              Now with an AI symptom checker
            </div>
            <h1 className="landing-headline">Your pets whole health story, in one place.</h1>
            <p className="landing-subtext">
              Vaccinations, vet visits, medications and weight -- organised, portable, and ready the moment it
              matters. Share it with your vet in one link.
            </p>
            <div className="landing-ctas">
              <button onClick={() => navigate('/pets/new')} className="btn btn-primary">
                Add your first pet
                <Icon name="arrow_forward" size={20} />
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
                Symptom checker
              </button>
            </div>
          </div>

          <div className="landing-hero-right">
            <div className="landing-verdict-card">
              <div className="landing-card-row">
                <Icon name="vaccines" size={21} />
                DHPP · next due Apr 2026
              </div>
              <div className="landing-card-row alert">
                <Icon name="error" size={21} filled />
                Rabies booster · 2 weeks overdue
              </div>
              <div className="landing-card-row">
                <Icon name="monitor_weight" size={21} />
                24.0 kg · +0.3 since last
              </div>
              <div className="landing-urgency">
                <div className="landing-urgency-tag">Urgency · level 2 of 3</div>
                <div className="landing-urgency-headline">See a vet within 48 hours</div>
                <div className="landing-urgency-body">Not an emergency tonight, but this needs care soon.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-section-header">
            <h2>Everything a pet owner keeps losing</h2>
            <p>Paper records go missing, boosters lapse quietly, and at 11pm there is nowhere good to turn.</p>
          </div>
          <div className="landing-features">
            {FEATURES.map((f) => (
              <div key={f.icon} className="landing-feature-card">
                <span className={`landing-feature-icon tone-${f.icon.slice(0, 3)}`}>
                  <Icon name={f.icon} size={25} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-section-header">
            <h2>How it works</h2>
            <p>Three steps, about two minutes.</p>
          </div>
          <div className="landing-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="landing-step-card">
                <span className="landing-step-number">{s.n}</span>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="landing-trust">
          <Icon name="verified_user" size={22} />
          <span>
            <b>On the AI:</b> PetLog symptom checker gives general guidance and an urgency level -- it never
            diagnoses, and it always tells you when to see a vet. It is not a substitute for professional care.
          </span>
        </div>

        <section className="landing-cta-band">
          <h2>Start with one pet. It takes two minutes.</h2>
          <p>Free while we are in beta. Your records stay yours.</p>
          <button onClick={() => navigate('/pets/new')} className="btn btn-primary landing-cta-btn">
            Get started
            <Icon name="arrow_forward" size={20} />
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-col">
            <div className="landing-footer-brand">PetLog</div>
            <p className="landing-footer-desc">Pet health records that travel with you.</p>
          </div>
          <div className="landing-footer-col">
            <h3>Product</h3>
            <a href="#symptom">Symptom checker</a>
            <a href="#sharing">Sharing</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="landing-footer-col">
            <h3>Company</h3>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#blog">Blog</a>
          </div>
          <div className="landing-footer-col">
            <h3>Legal</h3>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#ai-safety">AI &amp; safety</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>© 2026 PetLog</span>
          <span>·</span>
          <span>Not a substitute for veterinary care</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
