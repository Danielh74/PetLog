import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import AppLayout from '../components/AppLayout.tsx';
import { getMyPets } from '../api/pets.ts';
import { getReminders, updateReminder } from '../api/reminders.ts';
import type { Pet, Reminder } from '../types/index.ts';
import { speciesIcon, speciesLabel, speciesTone, ageFromDob, relativeDue } from '../utils/petMeta.ts';
import './Dashboard.css';

/* Reminder titles are free text, so the type is inferred. Icon and tint always
   travel together — the colour is a scanning aid, never the only cue. */
const reminderKind = (title: string): { icon: string; tone: string } => {
  const t = title.toLowerCase();
  if (t.includes('vacc') || t.includes('rabies') || t.includes('dhpp')) return { icon: 'vaccines', tone: 'vax' };
  if (t.includes('vet') || t.includes('wellness')) return { icon: 'stethoscope', tone: 'vet' };
  if (t.includes('flea') || t.includes('med')) return { icon: 'medication', tone: 'med' };
  if (t.includes('weigh')) return { icon: 'monitor_weight', tone: 'wt' };
  return { icon: 'event', tone: 'other' };
};

const petIdOf = (r: Reminder): string => (typeof r.pet === 'object' ? r.pet._id : r.pet);
const petNameOf = (r: Reminder): string => (typeof r.pet === 'object' ? r.pet.name : 'Pet');

const Dashboard = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();

  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const [petsData, remindersData] = await Promise.all([getMyPets(), getReminders()]);
      setPets(petsData);
      setReminders(remindersData);
    } catch {
      setError('We could not reach PetLog just now. Your records are safe.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // The nav links to /dashboard#pets and /dashboard#reminders rather than to
  // separate routes, so the hash is what moves the page. Waiting on `loading`
  // matters: before the data lands the sections are too short to scroll to.
  useEffect(() => {
    if (!hash || loading) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, loading]);

  const retry = () => {
    setLoading(true);
    setError('');
    void load();
  };

  const markDone = async (id: string) => {
    setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, isDone: true } : r)));
    try {
      await updateReminder(id, { isDone: true });
    } catch {
      // Put it back rather than leaving a tick the server never recorded.
      setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, isDone: false } : r)));
    }
  };

  const filteredPets = pets.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  const pending = reminders.filter((r) => !r.isDone);
  const now = Date.now();
  const overdue = pending
    .filter((r) => new Date(r.dueDate).getTime() < now)
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  const upcoming = pending
    .filter((r) => new Date(r.dueDate).getTime() >= now)
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

  const overdueByPet = new Map<string, number>();
  overdue.forEach((r) => {
    const petId = petIdOf(r);
    overdueByPet.set(petId, (overdueByPet.get(petId) ?? 0) + 1);
  });
  const healthyPets = pets.filter((p) => (overdueByPet.get(p._id) ?? 0) === 0).length;

  const renderReminder = (r: Reminder, isOverdue: boolean) => {
    const kind = reminderKind(r.title);
    return (
    <div key={r._id} className={`reminder-row${isOverdue ? ' overdue' : ''}`}>
      <span className={`avatar reminder-avatar ${isOverdue ? 'overdue' : `tone-${kind.tone}`}`}>
        <Icon name={isOverdue ? 'error' : kind.icon} size={21} filled={isOverdue} />
      </span>
      <div className="reminder-main">
        <div className="reminder-line">{r.title}</div>
        {/* The pet is a link because this list mixes every pet together —
            it is the only way to get from a reminder to its animal. */}
        <button className="reminder-pet-link" onClick={() => navigate(`/pets/${petIdOf(r)}`)}>
          {petNameOf(r)}
        </button>
      </div>
      <span className="reminder-when">{relativeDue(r.dueDate).label}</span>
      <button className="icon-btn" onClick={() => void markDone(r._id)} aria-label={`Mark "${r.title}" done`}>
        <Icon name="check_circle" size={21} />
      </button>
    </div>
    );
  };

  return (
    <AppLayout>
      <div className="page">
        <div className="top-bar shell-topbar dash-topbar">
          <span className="grow" />
          <div className="row gap-sm search-wrap">
            <Icon name="search" size={19} className="muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pets..."
              className="search-input"
              aria-label="Search pets"
            />
          </div>
        </div>

        <div className="scroll-area">
          <div className="page-pad">
            {loading && (
              <div className="center spinner-wrap">
                <span className="spinner" />
              </div>
            )}

            {!loading && error && (
              <div className="load-error" role="alert">
                <span className="avatar load-error-icon">
                  <Icon name="cloud_off" size={26} />
                </span>
                <div className="load-error-copy">
                  <div className="load-error-title">{error}</div>
                  <p className="muted load-error-body">
                    This is a connection problem, not a problem with your pets' records.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={retry}>
                  <Icon name="refresh" size={18} />
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* ---------- Pets ---------- */}
                <section id="pets" className="dash-section">
                  <div className="dash-section-head">
                    <h1 className="dash-heading">My Pets</h1>
                    <button onClick={() => navigate('/pets/new')} className="btn btn-primary btn-sm">
                      <Icon name="add" size={19} />
                      Add pet
                    </button>
                  </div>

                  <div className="attention-bar">
                    <div className="attention-pill overdue">
                      <Icon name="error" size={19} filled />
                      {overdue.length} overdue
                    </div>
                    <div className="attention-pill upcoming">
                      <Icon name="event_upcoming" size={19} />
                      {upcoming.length} due soon
                    </div>
                    <div className="attention-pill healthy">
                      <Icon name="favorite" size={19} filled />
                      {healthyPets} healthy
                    </div>
                  </div>

                  <div className="pets-grid">
                    {filteredPets.length === 0 && (
                      <div className="muted empty-state">
                        {pets.length === 0
                          ? 'No pets yet — add your first one to get a care plan.'
                          : 'No pets match your search.'}
                      </div>
                    )}
                    {filteredPets.map((pet) => {
                      const petOverdue = overdueByPet.get(pet._id) ?? 0;
                      return (
                        <button
                          key={pet._id}
                          onClick={() => navigate(`/pets/${pet._id}`)}
                          className="pet-card"
                          aria-label={`Open ${pet.name}'s profile`}
                        >
                          {petOverdue > 0 && (
                            <span className="pet-card-badge" title={`${petOverdue} overdue`}>
                              {petOverdue}
                            </span>
                          )}
                          <span className={`avatar pet-card-avatar ${speciesTone[pet.species]}`}>
                            <Icon name={speciesIcon[pet.species]} size={26} filled />
                          </span>
                          <span className="pet-name">{pet.name}</span>
                          <span className="muted pet-meta">{pet.breed || speciesLabel[pet.species]}</span>
                          <span className="muted pet-card-footer">
                            <Icon name="cake" size={14} />
                            {ageFromDob(pet.dob)}
                          </span>
                        </button>
                      );
                    })}
                    <button onClick={() => navigate('/pets/new')} className="add-pet-dashed">
                      <Icon name="add" size={26} />
                      Add pet
                    </button>
                  </div>
                </section>

                {/* ---------- Reminders ---------- */}
                <section id="reminders" className="dash-section">
                  <div className="dash-section-head">
                    <h2 className="dash-heading">Reminders</h2>
                    <span className="muted dash-section-count">
                      {pending.length} open
                    </span>
                  </div>

                  {pending.length === 0 && (
                    <p className="muted empty-state">
                      Nothing due. Reminders you accept when adding a pet show up here.
                    </p>
                  )}

                  {overdue.length > 0 && (
                    <>
                      <div className="reminder-group-label overdue">Overdue</div>
                      {overdue.map((r) => renderReminder(r, true))}
                    </>
                  )}

                  {upcoming.length > 0 && (
                    <>
                      <div className="reminder-group-label">Coming up</div>
                      {upcoming.map((r) => renderReminder(r, false))}
                    </>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
