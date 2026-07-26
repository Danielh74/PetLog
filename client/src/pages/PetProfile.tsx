import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import Toast from '../components/Toast.tsx';
import DateInput from '../components/DateInput.tsx';
import ConfirmDialog from '../components/ConfirmDialog.tsx';
import AppLayout from '../components/AppLayout.tsx';
import Portal from '../components/Portal.tsx';
import { useToast } from '../utils/useToast.ts';
import { getPet, updatePet, deletePet, type UpdatePetInput } from '../api/pets.ts';
import { createRecord, type CreateRecordInput } from '../api/records.ts';
import { getReminders, updateReminder } from '../api/reminders.ts';
import type { HealthRecord, HealthRecordType, Pet, Reminder, Species } from '../types/index.ts';
import { ageFromDob, formatDate, relativeDue, speciesIcon, speciesLabel } from '../utils/petMeta.ts';
import './PetProfile.css';

const SPECIES_LABELS: Record<Species, string> = {
  dog: 'Dog',
  cat: 'Cat',
  bird: 'Bird',
  rabbit: 'Rabbit',
  other: 'Other',
};

const TYPE_META: Record<HealthRecordType, { icon: string; label: string; tone: string }> = {
  vaccination: { icon: 'vaccines', label: 'Vaccination', tone: 'vax' },
  vet_visit: { icon: 'stethoscope', label: 'Vet visit', tone: 'vet' },
  medication: { icon: 'medication', label: 'Medication', tone: 'med' },
  weight: { icon: 'monitor_weight', label: 'Weight', tone: 'wt' },
  grooming: { icon: 'content_cut', label: 'Grooming', tone: 'groom' },
  other: { icon: 'event_note', label: 'Other', tone: 'other' },
};

type FilterId = HealthRecordType | 'all';

/* Six pills overflowed into a horizontal scroller, which hides options behind
   a gesture people do not know is there. The three that carry most of the log
   stay visible; the rest live in an overflow menu. */
const PRIMARY_FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'vaccination', label: 'Vaccines' },
  { id: 'vet_visit', label: 'Vet' },
];

const OVERFLOW_FILTERS: { id: FilterId; label: string }[] = [
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
      <div className="sheet-title">{meta.label}</div>
      <div className="sheet-body">
        <div className="field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <DateInput label="Date" value={date} onChange={setDate} />
        {type === 'weight' && (
          <div className="field">
            <label>Weight (kg)</label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" />
          </div>
        )}
        {(type === 'vaccination' || type === 'medication') && (
          <DateInput label="Next due (optional)" value={nextDueDate} onChange={setNextDueDate} />
        )}
        <div className="field">
          <label>Notes (optional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dr. Patel · Maple Vet Clinic" />
        </div>
        {/* Same action pair as Edit pet: secondary back to the type list,
            primary to commit. Both dialogs now close the same way. */}
        <div className="sheet-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            Back
          </button>
          <button className="btn btn-primary" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const EditPetForm = ({
  pet,
  onCancel,
  onSaved,
}: {
  pet: Pet;
  onCancel: () => void;
  onSaved: (input: UpdatePetInput) => void;
}) => {
  const [name, setName] = useState(pet.name);
  const [species, setSpecies] = useState<Species>(pet.species);
  const [breed, setBreed] = useState(pet.breed ?? '');
  const [dob, setDob] = useState(pet.dob ?? '');

  const submit = () => {
    onSaved({
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
      ...(dob && { dob: new Date(dob).toISOString() }),
    });
  };

  return (
    <div>
      <div className="sheet-title">Edit pet</div>
      <div className="sheet-body">
        <div className="field">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Species</label>
          <select value={species} onChange={(e) => setSpecies(e.target.value as Species)}>
            {Object.entries(SPECIES_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Breed</label>
          <input value={breed} onChange={(e) => setBreed(e.target.value)} />
        </div>
        <DateInput label="Birthday" value={dob} onChange={setDob} />
        <div className="sheet-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const PetProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [pet, setPet] = useState<Pet | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [chosenType, setChosenType] = useState<HealthRecordType | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    if (!id) return;
    getPet(id)
      .then(setPet)
      .catch(() => setError('Could not load this pet.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  // There is no per-pet reminders endpoint, so scope the full list here.
  // A failure is silent: reminders are secondary to the record itself.
  useEffect(() => {
    if (!id) return;
    getReminders()
      .then((all) => setReminders(all.filter((r) => (typeof r.pet === 'object' ? r.pet._id : r.pet) === id)))
      .catch(() => {});
  }, [id]);

  const markReminderDone = async (reminderId: string) => {
    setReminders((prev) => prev.map((r) => (r._id === reminderId ? { ...r, isDone: true } : r)));
    try {
      await updateReminder(reminderId, { isDone: true });
    } catch {
      setReminders((prev) => prev.map((r) => (r._id === reminderId ? { ...r, isDone: false } : r)));
    }
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setChosenType(null);
    setSheetError('');
  };

  // A rejected save used to reject silently: the sheet stayed open with no
  // message, which reads as "the button does nothing".
  const handleSaveRecord = async (input: CreateRecordInput) => {
    if (!id) return;
    setSheetError('');
    try {
      await createRecord(id, input);
    } catch {
      setSheetError('Could not save this record. Check the details and try again.');
      return;
    }
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

  const handleUpdatePet = async (input: UpdatePetInput) => {
    if (!id) return;
    setSheetError('');
    try {
      await updatePet(id, input);
    } catch {
      setSheetError('Could not save these changes. Please try again.');
      return;
    }
    setEditOpen(false);
    showToast('Pet updated');
    load();
  };

  const handleDeletePet = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deletePet(id);
      navigate('/dashboard');
    } catch {
      setDeleting(false);
      showToast('Could not delete this pet. Please try again.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="center profile-center-fill">
          <span className="spinner" />
        </div>
      </AppLayout>
    );
  }

  if (error || !pet) {
    return (
      <AppLayout>
        <div className="center profile-center-fill with-pad">
          <p className="muted">{error || 'Pet not found.'}</p>
        </div>
      </AppLayout>
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
  const petPending = reminders
    .filter((r) => !r.isDone)
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  const overflowActive = OVERFLOW_FILTERS.find((f) => f.id === filter);

  return (
    <AppLayout>
      <div className="page">
        <div className="top-bar shell-topbar">
          <button className="topbar-back-link" onClick={() => navigate('/dashboard')}>
            <Icon name="arrow_back" size={18} />
            My Pets
          </button>
          <span className="grow" />
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

            {/* Actions sit with the pet they act on rather than in the top bar.
                Five controls could not share a 375px bar, and here they wrap
                onto a second line instead of overflowing. Edit and Delete are
                stated outright — hiding destructive actions behind a kebab
                makes them harder to find without making them safer. */}
            <div className="pet-actions">
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/pets/${id}/symptom-check`)}>
                <Icon name="health_and_safety" size={18} filled />
                Symptom check
              </button>
              <button className="btn btn-outline btn-sm" onClick={handleShare}>
                <Icon name="ios_share" size={17} />
                Share
              </button>
              <span className="pet-actions-gap" />
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSheetError('');
                  setEditOpen(true);
                }}
              >
                <Icon name="edit" size={17} />
                Edit
              </button>
              <button className="btn btn-outline btn-sm btn-danger-outline" onClick={() => setDeleteOpen(true)}>
                <Icon name="delete" size={17} />
                Delete
              </button>
            </div>

            <div className="profile-columns">
              <div className="profile-col-main">
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

                <div className="card">
                  <div className="row gap-sm pet-reminders-header">
                    <span className="pet-reminders-title grow">Reminders</span>
                    <span className="muted pet-reminders-count">{petPending.length} open</span>
                  </div>
                  {petPending.length === 0 ? (
                    <p className="muted pet-reminders-empty">Nothing due for {pet.name}.</p>
                  ) : (
                    petPending.map((r) => {
                      const due = relativeDue(r.dueDate);
                      return (
                        <div key={r._id} className={`pet-reminder-row${due.overdue ? ' overdue' : ''}`}>
                          <Icon
                            name={due.overdue ? 'error' : 'event_upcoming'}
                            size={19}
                            filled={due.overdue}
                            className="flex-none"
                          />
                          <div className="min-w-0 grow">
                            <div className="pet-reminder-title">{r.title}</div>
                            <div className="pet-reminder-due">{due.label}</div>
                          </div>
                          <button
                            className="icon-btn icon-btn-sm"
                            onClick={() => void markReminderDone(r._id)}
                            aria-label={`Mark "${r.title}" done`}
                          >
                            <Icon name="check_circle" size={19} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {weightRecords.length > 1 && (
                  <div className="card">
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
              </div>

              <div className="card profile-col-log">
                <div className="row gap-sm health-log-header">
                  <span className="health-log-title grow">Health log</span>
                  <button className="icon-btn log-add-btn" onClick={() => setSheetOpen(true)} aria-label="Add record">
                    <Icon name="add" size={19} />
                  </button>
                </div>

                <div className="filter-row">
                  {PRIMARY_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      className={`pill${filter === f.id ? ' active' : ''}`}
                      onClick={() => setFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}

                  {/* A selection made from the menu is promoted into the row,
                      so the current filter is never invisible. */}
                  {overflowActive && (
                    <button className="pill active" onClick={() => setFilter('all')}>
                      {overflowActive.label}
                      <Icon name="close" size={14} />
                    </button>
                  )}

                  <div className="filter-menu-anchor">
                    <button
                      className={`pill filter-more${filterMenuOpen ? ' open' : ''}`}
                      onClick={() => setFilterMenuOpen((v) => !v)}
                      aria-haspopup="menu"
                      aria-expanded={filterMenuOpen}
                      aria-label="More filters"
                    >
                      <Icon name="more_horiz" size={18} />
                    </button>
                    {filterMenuOpen && (
                      <>
                        <div className="menu-backdrop" onClick={() => setFilterMenuOpen(false)} />
                        <div className="filter-menu" role="menu">
                          {OVERFLOW_FILTERS.map((f) => (
                            <button
                              key={f.id}
                              role="menuitemradio"
                              aria-checked={filter === f.id}
                              className={`filter-menu-item${filter === f.id ? ' active' : ''}`}
                              onClick={() => {
                                setFilter(f.id);
                                setFilterMenuOpen(false);
                              }}
                            >
                              {f.label}
                              {filter === f.id && <Icon name="check" size={16} />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
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
          </div>
        </div>

        {sheetOpen && (
          <Portal lockScroll>
            <div className="sheet-scrim" onClick={closeSheet} />
            <div className="sheet" role="dialog" aria-modal="true" aria-label="Add a record">
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
                <>
                  {sheetError && <p className="sheet-error">{sheetError}</p>}
                  <AddRecordForm type={chosenType} onCancel={() => setChosenType(null)} onSaved={handleSaveRecord} />
                </>
              )}
            </div>
          </Portal>
        )}

        {editOpen && (
          <Portal lockScroll>
            <div className="sheet-scrim" onClick={() => setEditOpen(false)} />
            <div className="sheet" role="dialog" aria-modal="true" aria-label={`Edit ${pet.name}`}>
              {sheetError && <p className="sheet-error">{sheetError}</p>}
              <EditPetForm pet={pet} onCancel={() => setEditOpen(false)} onSaved={handleUpdatePet} />
            </div>
          </Portal>
        )}

        {deleteOpen && (
          <ConfirmDialog
            title="Delete this pet?"
            message={`This permanently removes ${pet.name} and all of their health records and reminders. This can't be undone.`}
            confirmLabel="Delete"
            danger
            busy={deleting}
            onCancel={() => setDeleteOpen(false)}
            onConfirm={handleDeletePet}
          />
        )}

        {toast && <Toast message={toast} />}
      </div>
    </AppLayout>
  );
};

export default PetProfile;
