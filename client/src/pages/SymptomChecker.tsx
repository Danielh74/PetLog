import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import { getPet } from '../api/pets.ts';
import { checkSymptoms } from '../api/ai.ts';
import type { Pet, SymptomCheckResult, Urgency } from '../types/index.ts';

type Step = 'intro' | 'q1' | 'q2' | 'q3' | 'loading' | 'verdict' | 'error';

const Q = [
  { key: 'q1' as const, title: 'How long has this been going on?', options: ['Just today', '1–2 days', '2–3 days', 'Over a week'] },
  { key: 'q2' as const, title: 'Are they eating normally?', options: ['Normally', 'Mostly', 'Very little', 'Not at all'] },
  { key: 'q3' as const, title: 'Any of these warning signs?', options: ['None', 'Vomiting', 'Lethargic / weak', 'Trouble breathing'] },
];

const LOADING_MESSAGES = ['Reviewing the answers…', 'Comparing with care history…', 'Gauging urgency level…'];

const VERDICT_META: Record<Urgency, { icon: string; tag: string; headline: string; tone: 'ok' | 'watch' | 'alert' }> = {
  can_wait: { icon: 'check_circle', tag: 'Low urgency', headline: 'Keep an eye on them', tone: 'ok' },
  within_48h: { icon: 'schedule', tag: 'Moderate urgency', headline: 'See a vet within 48 hours', tone: 'watch' },
  go_now: { icon: 'emergency', tag: 'High urgency', headline: 'Go now', tone: 'alert' },
};

const SymptomChecker = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [step, setStep] = useState<Step>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({ q1: '2–3 days', q2: 'Mostly', q3: 'None' });
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);
  const msgTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) getPet(id).then(setPet).catch(() => {});
  }, [id]);

  useEffect(() => () => {
    if (msgTimer.current) clearInterval(msgTimer.current);
  }, []);

  const qIndex = Q.findIndex((q) => q.key === step);

  const runCheck = async () => {
    if (!id) return;
    setStep('loading');
    setLoadingMsg(0);
    msgTimer.current = setInterval(() => setLoadingMsg((m) => Math.min(m + 1, 2)), 700);

    const symptoms = `Duration of symptoms: ${answers.q1}. Eating: ${answers.q2}. Warning signs reported: ${answers.q3}.`;
    try {
      const data = await checkSymptoms(id, symptoms);
      setResult(data);
      setStep('verdict');
    } catch {
      setResult(null);
      setStep('error');
    } finally {
      if (msgTimer.current) clearInterval(msgTimer.current);
    }
  };

  const handleNext = () => {
    if (step === 'intro') setStep('q1');
    else if (qIndex >= 0 && qIndex < Q.length - 1) setStep(Q[qIndex + 1]!.key);
    else if (step === 'q3') void runCheck();
  };

  const handleBack = () => {
    if (step === 'intro') navigate(`/pets/${id}`);
    else if (qIndex === 0) setStep('intro');
    else if (qIndex > 0) setStep(Q[qIndex - 1]!.key);
    else navigate(`/pets/${id}`);
  };

  const currentQ = Q.find((q) => q.key === step);

  return (
    <div className="app-shell">
      <div className="page">
        <div className="top-bar">
          {step !== 'loading' && step !== 'verdict' && step !== 'error' && (
            <button className="icon-btn" onClick={handleBack}>
              <Icon name="arrow_back" />
            </button>
          )}
          <span className="grow topbar-title">
            Symptom checker
          </span>
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
              <div className="center intro-wrap">
                <div className="avatar intro-avatar">
                  <Icon name="health_and_safety" size={40} filled />
                </div>
                <h2 className="intro-title">Is {pet?.name ?? 'your pet'} okay?</h2>
                <p className="muted intro-subtitle">
                  Answer a few quick questions and we'll gauge how urgent it is. This isn't a diagnosis.
                </p>
                <div className="row gap-sm intro-warning-row">
                  <Icon name="info" size={20} filled className="flex-none" />
                  If {pet?.name ?? 'your pet'} is struggling to breathe or has collapsed, contact a vet immediately.
                </div>
              </div>
            )}

            {currentQ && (
              <div>
                <h2 className="question-title">{currentQ.title}</h2>
                <div className="stack gap-sm">
                  {currentQ.options.map((o) => {
                    const active = answers[currentQ.key] === o;
                    return (
                      <button
                        key={o}
                        onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.key]: o }))}
                        className={`row option-row${active ? ' active' : ''}`}
                      >
                        <span>{o}</span>
                        <span className={`option-check${active ? ' active' : ''}`}>
                          <Icon name="check" size={16} />
                        </span>
                      </button>
                    );
                  })}
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
                  This is not a signal that {pet?.name ?? 'your pet'} is fine. If anything seems urgent, please
                  contact a vet directly. Otherwise, try running the check again in a moment.
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
          {(step === 'intro' || currentQ) && (
            <button className="btn btn-primary" onClick={handleNext}>
              {step === 'intro' ? 'Start check' : step === 'q3' ? 'See result' : 'Next'}
            </button>
          )}
          {(step === 'verdict' || step === 'error') && (
            <button className="btn btn-outline" onClick={() => navigate(`/pets/${id}`)}>
              Back to {pet?.name ?? "pet's"} profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
