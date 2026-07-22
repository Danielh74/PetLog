import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import Toast from '../components/Toast.tsx';
import { useToast } from '../utils/useToast.ts';
import { getPet } from '../api/pets.ts';
import { createRecord, type CreateRecordInput } from '../api/records.ts';
import type { HealthRecord, HealthRecordType, Pet } from '../types/index.ts';
import { ageFromDob, formatDate, speciesIcon, speciesLabel } from '../utils/petMeta.ts';

const TYPE_META: Record<HealthRecordType, { icon: string; label: string; tone: string }> = {
  vaccination: { icon: 'vaccines', label: 'Vaccination', tone: 'vax' },
  vet_visit: { icon: 'stethoscope', label: 'Vet visit', tone: 'vet' },
  medication: { icon: 'medication', label: 'Medication', tone: 'med' },
  weight: { icon: 'monitor_weight', label: 'Weight', tone: 'wt' },
  grooming: { icon: 'content_cut', label: 'Grooming', tone: 'groom' },
  other: { icon: 'event_note', label: 'Other', tone: 'other' },
};

const FILTERS: { id: HealthRecordType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'vaccination', label: 'Vaccines' },
  { id: 'vet_visit', label: 'Vet' },
  { id: 'medication', label: 'Meds' },
  { id: 'weight', label: 'Weight' },
  { id: 'grooming', label: 'Grooming' },
];

const AddRecordForm = ({
  type,
  onCancel,
  onSaved,
}: {
  type: HealthRecordType;
  onCancel: () => void;
  onSaved: (input: CreateRecordInput) => void;
}) => {
  const meta = TYPE_META[type];
  const [title, setTitle] = useState(meta.label);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  const submit = () => {
    onSaved({
      type,
      title: title.trim() || meta.label,
      date: new Date(date).toISOString(),
      ...(notes && { notes }),
      ...(type === 'weight' && weight && { weight: Number(weight) }),
      ...(nextDueDate && { nextDueDate: new Date(nextDueDate).toISOString() }),
    });
  };

  return (
    <div>
      <div className="row gap-sm sheet-title">
        <button className="icon-btn add-record-back" onClick={onCancel}>
          <Icon name="arrow_back" size={20} />
        </button>
        {meta.label}
      </div>
      <div className="add-record-body">
        <div className="field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {type === 'weight' && (
          <div className="field">
            <label>Weight (kg)</label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" />
          </div>
        )}
        {(type === 'vaccination' || type === 'medication') && (
          <div className="field">
            <label>Next due (optional)</label>
            <input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />
          </div>
        )}
        <div className="field">
          <label>Notes (optional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dr. Patel · Maple Vet Clinic" />
        </div>
        <button className="btn btn-primary" onClick={submit}>
          Save
        </button>
      </div>
    </div>
  );
};

const PetProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<HealthRecordType | 'all'>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [chosenType, setChosenType] = useState<HealthRecordType | null>(null);

  const load = () => {
    if (!id) return;
    getPet(id)
      .then(setPet)
      .catch(() => setError('Could not load this pet.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const closeSheet = () => {
    setSheetOpen(false);
    setChosenType(null);
  };

  const handleSaveRecord = async (input: CreateRecordInput) => {
    if (!id) return;
    await createRecord(id, input);
    closeSheet();
    showToast(`${TYPE_META[input.type].label} added to ${pet?.name}'s log`);
    load();
  };

  const handleShare = async () => {
    if (!pet) return;
    const link = `${window.location.origin}/share/${pet.shareToken}`;
    await navigator.clipboard.writeText(link);
    showToast('Share link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="app-shell center profile-center-fill">
        <span className="spinner" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="app-shell center profile-center-fill with-pad">
        <p className="muted">{error || 'Pet not found.'}</p>
      </div>
    );
  }

  const records = (pet.healthRecords ?? []).slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const shown = filter === 'all' ? records : records.filter((r) => r.type === filter);
  const weightRecords = records
    .filter((r): r is HealthRecord & { weight: number } => r.type === 'weight' && r.weight != null)
    .slice()
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(-6);
  const latestWeight = weightRecords.at(-1)?.weight;
  const wMax = weightRecords.length ? Math.max(...weightRecords.map((w) => w.weight)) : 1;
  const wMin = weightRecords.length ? Math.min(...weightRecords.map((w) => w.weight)) : 0;

  return (
    <div className="app-shell">
      <div className="page">
        <div className="top-bar profile-topbar">
          <button className="icon-btn" onClick={() => navigate('/dashboard')}>
            <Icon name="arrow_back" />
          </button>
          <span className="grow" />
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/pets/${id}/symptom-check`)}>
            <Icon name="health_and_safety" size={18} filled />
            Check symptom
          </button>
          <button className="icon-btn" onClick={handleShare} aria-label="Share">
            <Icon name="ios_share" size={23} />
          </button>
        </div>

        <div className="scroll-area">
          <div className="page-pad profile-scroll-pad">
            <div className="row gap-md profile-header-row">
              <span className="avatar profile-avatar">
                <Icon name={speciesIcon[pet.species]} size={40} filled />
              </span>
              <div className="min-w-0">
                <h1 className="profile-name">{pet.name}</h1>
                <div className="muted profile-meta">{pet.breed || speciesLabel[pet.species]}</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="card stat-card">
                <div className="stat-value">{ageFromDob(pet.dob)}</div>
                <div className="muted stat-label">Age</div>
              </div>
              <div className="card stat-card">
                <div className="stat-value">{latestWeight != null ? `${latestWeight} kg` : '—'}</div>
                <div className="muted stat-label">Weight</div>
              </div>
              <div className="card stat-card">
                <div className="stat-value">{records.length}</div>
                <div className="muted stat-label">Records</div>
              </div>
            </div>

            {weightRecords.length > 1 && (
              <div className="card weight-card">
                <div className="row weight-header">
                  <span className="weight-title">Weight trend</span>
                  <span className="muted weight-unit">kg</span>
                </div>
                <div className="weight-bars">
                  {weightRecords.map((w, i) => (
                    <div key={w._id} className="weight-bar-col">
                      <div
                        className={`weight-bar${i === weightRecords.length - 1 ? ' latest' : ''}`}
                        style={{ height: `${10 + ((w.weight - wMin) / Math.max(wMax - wMin, 1)) * 90}%` }}
                      />
                      <span className="muted weight-bar-label">{formatDate(w.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pill-row filter-row">
              {FILTERS.map((f) => (
                <button key={f.id} className={`pill${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>

            {shown.length === 0 && <p className="muted empty-state">No records in this filter yet.</p>}

            <div className="record-timeline">
              {shown.map((r, i) => {
                const meta = TYPE_META[r.type];
                return (
                  <div key={r._id} className="row gap-md record-row">
                    <div className="stack record-icon-col">
                      <span className={`avatar record-icon tone-${meta.tone}`}>
                        <Icon name={meta.icon} size={20} />
                      </span>
                      {i !== shown.length - 1 && <span className="record-line" />}
                    </div>
                    <div className="record-content">
                      <div className="row record-title-row">
                        <span className="record-title">{r.title}</span>
                        <span className="muted grow record-date">{formatDate(r.date)}</span>
                      </div>
                      {r.notes && <div className="muted record-notes">{r.notes}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button className="fab-round" onClick={() => setSheetOpen(true)} aria-label="Add record">
          <Icon name="add" size={28} />
        </button>

        {sheetOpen && (
          <>
            <div className="sheet-scrim" onClick={closeSheet} />
            <div className="sheet">
              <div className="sheet-handle" />
              {!chosenType ? (
                <>
                  <div className="sheet-title">Add a record</div>
                  {(['vaccination', 'vet_visit', 'medication', 'weight'] as HealthRecordType[]).map((t) => (
                    <button key={t} className="sheet-row" onClick={() => setChosenType(t)}>
                      <span className={`avatar record-icon tone-${TYPE_META[t].tone}`}>
                        <Icon name={TYPE_META[t].icon} size={22} />
                      </span>
                      <span className="care-toggle-title">{TYPE_META[t].label}</span>
                      <Icon name="chevron_right" size={20} className="muted ml-auto" />
                    </button>
                  ))}
                </>
              ) : (
                <AddRecordForm type={chosenType} onCancel={() => setChosenType(null)} onSaved={handleSaveRecord} />
              )}
            </div>
          </>
        )}

        {toast && <Toast message={toast} />}
      </div>
    </div>
  );
};

export default PetProfile;
