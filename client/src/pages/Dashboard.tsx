import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { getMyPets } from '../api/pets.ts';
import { getReminders } from '../api/reminders.ts';
import type { Pet, Reminder } from '../types/index.ts';
import { speciesIcon, relativeDue } from '../utils/petMeta.ts';

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Dashboard = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [petsData, remindersData] = await Promise.all([getMyPets(), getReminders()]);
        setPets(petsData);
        setReminders(remindersData.filter((r) => !r.isDone));
      } catch {
        setError('Could not load your pets right now. Pull down to try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const overdue = reminders.filter((r) => new Date(r.dueDate).getTime() < Date.now());
  const upcoming = reminders.filter((r) => new Date(r.dueDate).getTime() >= Date.now()).slice(0, 4);

  const petName = (r: Reminder) => (typeof r.pet === 'object' ? r.pet.name : '');

  return (
    <div className="app-shell">
      <div className="page">
        <div className="top-bar dash-topbar">
          <span className="grow dash-title">My Pets</span>
          <button className="icon-btn" onClick={() => navigate('/reminders')} aria-label="Reminders">
            <Icon name="notifications" />
          </button>
          <span className="avatar user-avatar-sm">{appUser ? initials(appUser.name) : '··'}</span>
        </div>

        <div className="scroll-area">
          <div className="page-pad">
            {loading && (
              <div className="center spinner-wrap">
                <span className="spinner" />
              </div>
            )}

            {!loading && error && <p className="error-text">{error}</p>}

            {!loading && !error && (
              <>
                <div className="muted section-label">Your pets · {pets.length}</div>
                <div className="pets-grid">
                  {pets.length === 0 && (
                    <div className="muted empty-state">
                      No pets yet — add your first one to get a care plan.
                    </div>
                  )}
                  {pets.map((pet) => (
                    <button key={pet._id} onClick={() => navigate(`/pets/${pet._id}`)} className="pet-card">
                      <span className="avatar pet-card-avatar">
                        <Icon name={speciesIcon[pet.species]} size={26} filled />
                      </span>
                      <span className="pet-name">{pet.name}</span>
                      <span className="muted pet-meta">{pet.breed || 'Mixed breed'}</span>
                    </button>
                  ))}
                  <button onClick={() => navigate('/pets/new')} className="add-pet-dashed">
                    <Icon name="add" size={22} />
                    Add pet
                  </button>
                </div>

                <div className="muted section-label">Reminders</div>

                {overdue.length > 0 && (
                  <div className="row gap-sm reminder-badge-row">
                    Overdue <span className="badge-count">{overdue.length}</span>
                  </div>
                )}
                {overdue.map((r) => (
                  <div key={r._id} className="row gap-md reminder-row-overdue">
                    <span className="avatar reminder-icon-alert">
                      <Icon name="vaccines" size={22} filled />
                    </span>
                    <div className="min-w-0">
                      <div className="reminder-line">
                        <b>{petName(r)}</b> — {r.title}
                      </div>
                      <div className="reminder-detail">Was due {new Date(r.dueDate).toLocaleDateString()}</div>
                    </div>
                    <span className="reminder-when">{relativeDue(r.dueDate).label}</span>
                  </div>
                ))}

                {upcoming.length > 0 && (
                  <div className="row gap-sm reminder-badge-row upcoming">
                    Upcoming <span className="badge-count neutral">{upcoming.length}</span>
                  </div>
                )}
                {upcoming.map((r) => (
                  <div key={r._id} className="row gap-md card reminder-row-upcoming">
                    <span className="avatar icon-avatar-sm">
                      <Icon name="event" size={22} />
                    </span>
                    <div className="min-w-0">
                      <div className="reminder-line">
                        <b>{petName(r)}</b> — {r.title}
                      </div>
                    </div>
                    <span className="muted reminder-when muted-when">{relativeDue(r.dueDate).label}</span>
                  </div>
                ))}

                {reminders.length === 0 && <p className="muted empty-reminders">No reminders yet.</p>}
              </>
            )}
          </div>
        </div>

        {!loading && pets.length > 0 && (
          <button className="fab" onClick={() => navigate('/pets/new')}>
            <Icon name="add" size={24} />
            Add pet
          </button>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

export default Dashboard;
