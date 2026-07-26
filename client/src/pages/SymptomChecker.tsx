import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import FocusedLayout from '../components/FocusedLayout.tsx';
import { getPet } from '../api/pets.ts';
import { checkSymptoms } from '../api/ai.ts';
import type { Pet, SymptomCheckResult, Urgency } from '../types/index.ts';
import './SymptomChecker.css';

type Step = 'intro' | 'loading' | 'verdict' | 'error';

/* Mirrors the server's symptomCheckSchema so the user is told before the
   round trip, not after a 400. */
const MIN_CHARS = 10;
const MAX_CHARS = 1000;

const LOADING_MESSAGES = ['Reading your description…', 'Comparing with care history…', 'Gauging urgency level…'];

const VERDICT_META: Record<Urgency, { icon: string; tag: string; headline: string; tone: 'ok' | 'watch' | 'alert' }> = {
  can_wait: { icon: 'check_circle', tag: 'Low urgency', headline: 'Keep an eye on them', tone: 'ok' },
  within_48h: { icon: 'schedule', tag: 'Moderate urgency', headline: 'See a vet within 48 hours', tone: 'watch' },
  go_now: { icon: 'emergency', tag: 'High urgency', headline: 'Go now', tone: 'alert' },
};

const ASIDE_ITEMS = [
  { icon: 'emergency', text: 'Struggling to breathe, collapsed, or non-responsive — go to an emergency vet immediately, skip this checker.' },
  { icon: 'schedule', text: 'Symptoms present over a day, with reduced appetite, usually warrant a same-week visit.' },
  { icon: 'info', text: "This tool estimates urgency only — it never replaces a vet's exam." },
];

const PROMPTS = [
  'What you are seeing, and since when',
  'Whether they are eating and drinking normally',
  'Anything different about their behaviour or energy',
];

const SymptomChecker = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [step, setStep] = useState<Step>('intro');
  const [symptoms, setSymptoms] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);
  const msgTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) getPet(id).then(setPet).catch(() => {});
  }, [id]);

  useEffect(() => () => {
    if (msgTimer.current) clearInterval(msgTimer.current);
  }, []);

  const petName = pet?.name ?? 'your pet';
  const trimmed = symptoms.trim();
  const canSubmit = trimmed.length >= MIN_CHARS;

  const runCheck = async () => {
    if (!id || !canSubmit) return;
    setStep('loading');
    setLoadingMsg(0);
    msgTimer.current = setInterval(() => setLoadingMsg((m) => Math.min(m + 1, LOADING_MESSAGES.length - 1)), 700);

    try {
      const data = await checkSymptoms(id, trimmed);
      setResult(data);
      setStep('verdict');
    } catch {
      setResult(null);
      setStep('error');
    } finally {
      if (msgTimer.current) clearInterval(msgTimer.current);
    }
  };

  return (
    <FocusedLayout asideTitle="Know the signs" asideItems={ASIDE_ITEMS}>
      <div className="page">
        <div className="top-bar">
          {step === 'intro' && (
            <button className="icon-btn" onClick={() => navigate(`/pets/${id}`)} aria-label="Back to profile">
              <Icon name="arrow_back" size={21} />
            </button>
          )}
          <span className="grow topbar-title">Symptom checker</span>
          {step !== 'loading' && (
            <span className="row gap-sm muted checker-ai-badge">
              <Icon name="auto_awesome" size={15} filled />
              AI
            </span>
          )}
        </div>

        <div className="scroll-area">
          <div className="checker-body">
            {step === 'intro' && (
              <div className="describe-wrap">
                <h2 className="intro-title">What is going on with {petName}?</h2>
                <p className="muted intro-subtitle">
                  Describe it in your own words. The more detail you give, the better we can judge how urgent it is.
                  This isn't a diagnosis.
                </p>

                <label className="describe-label" htmlFor="symptoms">
                  Describe the symptoms
                </label>
                <textarea
                  id="symptoms"
                  className="describe-input"
                  value={symptoms}
                  maxLength={MAX_CHARS}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={`e.g. ${petName} has been scratching one ear since yesterday and keeps tilting their head. Eating normally.`}
                  rows={7}
                  autoFocus
                  aria-describedby="symptoms-help symptoms-count"
                />

                <div className="describe-meta">
                  <span id="symptoms-help" className="muted describe-help">
                    {canSubmit
                      ? 'Add anything else you have noticed.'
                      : `A little more detail, please — at least ${MIN_CHARS} characters.`}
                  </span>
                  <span id="symptoms-count" className="muted describe-count">
                    {trimmed.length}/{MAX_CHARS}
                  </span>
                </div>

                <div className="describe-prompts">
                  <span className="describe-prompts-title">Helpful to mention</span>
                  <ul>
                    {PROMPTS.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="row gap-sm intro-warning-row">
                  <Icon name="info" size={20} filled className="flex-none" />
                  If {petName} is struggling to breathe or has collapsed, contact a vet immediately.
                </div>
              </div>
            )}

            {step === 'loading' && (
              <div className="center loading-wrap">
                <span className="spinner spinner-gap" />
                <div className="loading-text">{LOADING_MESSAGES[loadingMsg]}</div>
              </div>
            )}

            {step === 'error' && (
              <div className="center error-wrap">
                <div className="avatar error-avatar">
                  <Icon name="error" size={34} filled />
                </div>
                <h2 className="error-title">We couldn't complete the check</h2>
                <p className="muted error-body">
                  This is not a signal that {petName} is fine. If anything seems urgent, please contact a vet
                  directly. Otherwise, try running the check again in a moment.
                </p>
              </div>
            )}

            {step === 'verdict' && result && (
              <div>
                <div className={`verdict-card ${VERDICT_META[result.urgency].tone}`}>
                  <span className="verdict-icon-wrap">
                    <Icon name={VERDICT_META[result.urgency].icon} size={32} filled />
                  </span>
                  <div className="verdict-tag">{VERDICT_META[result.urgency].tag}</div>
                  <div className="verdict-headline">{VERDICT_META[result.urgency].headline}</div>
                </div>

                <div className="described-recap">
                  <span className="described-recap-label">You described</span>
                  <p className="muted">{trimmed}</p>
                </div>

                <div className="causes-title">Possible causes</div>
                <div className="stack gap-sm">
                  {result.causes.map((c, i) => (
                    <div key={i} className="card row gap-md cause-card">
                      <Icon name="health_and_safety" size={21} filled className="cause-icon" />
                      <div className="cause-text">
                        <b>{c.name}</b> <span className="muted cause-likelihood">({c.likelihood} likelihood)</span>
                        <div className="muted">{c.homeCare}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="muted disclaimer-text">
                  {result.disclaimer || "PetLog's checker offers guidance only and is not a substitute for professional veterinary advice."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="checker-footer">
          {step === 'intro' && (
            <button className="btn btn-primary" onClick={() => void runCheck()} disabled={!canSubmit}>
              Check symptoms
            </button>
          )}
          {step === 'error' && (
            <button className="btn btn-primary" onClick={() => setStep('intro')}>
              <Icon name="refresh" size={18} />
              Try again
            </button>
          )}
          {(step === 'verdict' || step === 'error') && (
            <button className="btn btn-outline" onClick={() => navigate(`/pets/${id}`)}>
              Back to {pet?.name ?? "pet's"} profile
            </button>
          )}
        </div>
      </div>
    </FocusedLayout>
  );
};

export default SymptomChecker;
