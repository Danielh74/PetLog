import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import { createPet } from '../api/pets.ts';
import { createReminder } from '../api/reminders.ts';
import { createRecord } from '../api/records.ts';
import type { Species } from '../types/index.ts';

const SPECIES_OPTIONS: { id: Species; label: string; icon: string }[] = [
  { id: 'dog', label: 'Dog', icon: 'sound_detection_dog_barking' },
  { id: 'cat', label: 'Cat', icon: 'pets' },
  { id: 'bird', label: 'Bird', icon: 'raven' },
  { id: 'rabbit', label: 'Rabbit', icon: 'cruelty_free' },
  { id: 'other', label: 'Other', icon: 'pets' },
];

interface CareItem {
  key: string;
  icon: string;
  tone: 'vax' | 'vet' | 'med' | 'wt';
  title: string;
  cadence: string;
  addMonths: number;
  defaultOn: boolean;
}

const CARE_TEMPLATE: CareItem[] = [
  { key: 'rabies', icon: 'vaccines', tone: 'vax', title: 'Rabies vaccine', cadence: 'Yearly booster', addMonths: 12, defaultOn: true },
  { key: 'dhpp', icon: 'vaccines', tone: 'vax', title: 'DHPP / core vaccine', cadence: 'Every 3 years', addMonths: 36, defaultOn: true },
  { key: 'flea', icon: 'medication', tone: 'med', title: 'Flea & tick', cadence: 'Monthly', addMonths: 1, defaultOn: true },
  { key: 'wellness', icon: 'stethoscope', tone: 'vet', title: 'Wellness checkup', cadence: 'Once a year', addMonths: 12, defaultOn: true },
  { key: 'weighin', icon: 'monitor_weight', tone: 'wt', title: 'Weight check-in', cadence: 'Monthly', addMonths: 1, defaultOn: false },
];

const addMonthsToNow = (months: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
};

const STEPS = ['species', 'details', 'plan'] as const;

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<(typeof STEPS)[number]>('species');
  const [species, setSpecies] = useState<Species>('dog');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState('');
  const [care, setCare] = useState<Record<string, boolean>>(
    Object.fromEntries(CARE_TEMPLATE.map((c) => [c.key, c.defaultOn])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const idx = STEPS.indexOf(step);

  const goBack = () => {
    if (idx === 0) navigate('/dashboard');
    else setStep(STEPS[idx - 1]!);
  };

  const finish = async () => {
    setSaving(true);
    setError('');
    try {
      const pet = await createPet({
        name,
        species,
        ...(breed && { breed }),
        ...(dob && { dob: new Date(dob).toISOString() }),
      });

      const jobs: Promise<unknown>[] = [];
      for (const item of CARE_TEMPLATE) {
        if (care[item.key]) {
          jobs.push(createReminder(pet._id, { title: item.title, dueDate: addMonthsToNow(item.addMonths) }));
        }
      }
      if (weight) {
        jobs.push(
          createRecord(pet._id, {
            type: 'weight',
            title: 'Weight logged',
            date: new Date().toISOString(),
            weight: Number(weight),
          }),
        );
      }
      await Promise.all(jobs);
      navigate(`/pets/${pet._id}`);
    } catch {
      setError('Could not save this pet. Please check the details and try again.');
      setSaving(false);
    }
  };

  const goNext = () => {
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]!);
    else void finish();
  };

  const ctaLabel = step === 'species' || step === 'details' ? 'Continue' : 'Create care plan';
  const ctaIcon = step === 'plan' ? 'check' : 'arrow_forward';
  const canContinue = step === 'details' ? name.trim().length > 0 : true;

  return (
    <div className="app-shell">
      <div className="page">
        <div className="top-bar">
          <button className="icon-btn" onClick={goBack}>
            <Icon name="arrow_back" />
          </button>
          <span className="grow topbar-title">
            Add a pet
          </span>
          <span className="muted topbar-hint">Step {idx + 1} of 3</span>
        </div>

        <div className="row gap-sm onb-progress-row">
          {STEPS.map((_, i) => (
            <span key={i} className={`progress-seg${i <= idx ? ' active' : ''}`} />
          ))}
        </div>

        <div className="scroll-area">
          <div className="onb-body">
            {step === 'species' && (
              <div>
                <h2 className="onb-heading">What kind of companion?</h2>
                <p className="muted onb-subheading">We'll tailor the care plan to their species.</p>
                <div className="species-grid">
                  {SPECIES_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSpecies(o.id)}
                      className={`species-card${species === o.id ? ' active' : ''}`}
                    >
                      <Icon name={o.icon} size={34} filled />
                      <span className="care-toggle-title">{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'details' && (
              <div>
                <h2 className="onb-heading">Tell us about them</h2>
                <p className="muted onb-subheading">Just the basics — you can edit later.</p>
                <div className="field">
                  <label>Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Buddy" />
                </div>
                <div className="field">
                  <label>Breed</label>
                  <input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Golden Retriever" />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Birthday</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Weight (kg)</label>
                    <input
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="32"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 'plan' && (
              <div>
                <div className="badge-suggested">
                  <Icon name="auto_awesome" size={16} filled />
                  Suggested for {species === 'other' ? 'pets' : `${species}s`}
                </div>
                <h2 className="onb-heading">Build their care plan</h2>
                <p className="muted onb-subheading-tight">Toggle the reminders you want. We'll schedule them automatically.</p>
                <div className="stack gap-sm">
                  {CARE_TEMPLATE.map((item) => {
                    const on = care[item.key];
                    return (
                      <div key={item.key} className="row gap-md card care-toggle-row">
                        <span className={`avatar care-toggle-icon tone-${item.tone}`}>
                          <Icon name={item.icon} size={21} />
                        </span>
                        <div className="min-w-0 grow">
                          <div className="care-toggle-title">{item.title}</div>
                          <div className="muted care-toggle-cadence">{item.cadence}</div>
                        </div>
                        <button
                          role="switch"
                          aria-checked={on}
                          onClick={() => setCare((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className={`switch-track${on ? ' on' : ''}`}
                        >
                          <span className="switch-knob" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {error && <p className="error-text onb-error">{error}</p>}
          </div>
        </div>

        <div className="onb-footer">
          <button className="btn btn-primary" onClick={goNext} disabled={!canContinue || saving}>
            {saving ? 'Saving…' : ctaLabel}
            {!saving && <Icon name={ctaIcon} size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
