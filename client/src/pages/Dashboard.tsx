import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import AppLayout from '../components/AppLayout.tsx';
import { getMyPets } from '../api/pets.ts';
import { getReminders } from '../api/reminders.ts';
import type { Pet, Reminder } from '../types/index.ts';
import { speciesIcon, speciesLabel, speciesTone, ageFromDob, relativeDue } from '../utils/petMeta.ts';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

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

  const filteredPets = pets.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  const getPetId = (reminder: Reminder): string => {
    return typeof reminder.pet === 'object' ? reminder.pet._id : reminder.pet;
  };

  const getPetName = (reminder: Reminder): string => {
    return typeof reminder.pet === 'object' ? reminder.pet.name : '';
  };

  const scopedReminders = selectedPetId ? reminders.filter((r) => getPetId(r) === selectedPetId) : reminders;
  const overdue = scopedReminders.filter((r) => new Date(r.dueDate).getTime() < Date.now());
  const upcoming = scopedReminders.filter((r) => new Date(r.dueDate).getTime() >= Date.now());

  const overdueByPet = new Map<string, number>();
  overdue.forEach((r) => {
    const petId = getPetId(r);
    overdueByPet.set(petId, (overdueByPet.get(petId) ?? 0) + 1);
  });

  const healthyPets = pets.filter((p) => (overdueByPet.get(p._id) ?? 0) === 0).length;

  const selectedPet = selectedPetId ? pets.find((p) => p._id === selectedPetId) : null;

  const reminderIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      vaccination: 'vaccines',
      vet_visit: 'stethoscope',
      medication: 'medication',
      weight: 'monitor_weight',
    };
    return iconMap[type] || 'event';
  };

  const reminderTone = (type: string) => {
    const toneMap: Record<string, string> = {
      vaccination: 'vax',
      vet_visit: 'vet',
      medication: 'med',
      weight: 'wt',
    };
    return toneMap[type] || '';
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
            />
          </div>
          <button className="icon-btn" onClick={() => navigate('/reminders')} aria-label="Reminders">
            <Icon name="notifications" size={21} />
          </button>
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
                        ? 'No pets yet - add your first one to get a care plan.'
                        : 'No pets match your search.'}
                    </div>
                  )}
                  {filteredPets.map((pet) => {
                    const petOverdue = overdueByPet.get(pet._id) ?? 0;
                    const isSelected = selectedPetId === pet._id;
                    return (
                      <button
                        key={pet._id}
                        onClick={() => setSelectedPetId(isSelected ? null : pet._id)}
                        className={`pet-card ${isSelected ? 'selected' : ''}`}
                      >
                        {petOverdue > 0 && <span className="pet-card-badge">{petOverdue}</span>}
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

                {selectedPet && (
                  <div className="selected-pet-detail">
                    <div className="selected-pet-header">
                      <span className="selected-pet-name">{selectedPet.name}</span>
                      <div className="selected-pet-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/pets/${selectedPet._id}`)}>
                          <Icon name="open_in_full" size={16} />
                          Full profile
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/pets/${selectedPet._id}/symptom-check`)}>
                          <Icon name="health_and_safety" size={16} filled />
                          Check
                        </button>
                        <button
                          className="icon-btn icon-btn-sm"
                          onClick={() => navigate(`/share/${selectedPet.shareToken}`)}
                          aria-label={`Share ${selectedPet.name}'s record`}
                        >
                          <Icon name="ios_share" size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="selected-pet-stats">
                      <div className="stat-card">
                        <div className="stat-value">{ageFromDob(selectedPet.dob)}</div>
                        <div className="stat-label">Age</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{selectedPet.healthRecords?.length ?? 0}</div>
                        <div className="stat-label">Records</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">{overdue.length}</div>
                        <div className="stat-label">Overdue</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="reminders-section">
                  <div className="section-label">
                    {selectedPet ? `${selectedPet.name} - Reminders` : 'All reminders'}
                    {selectedPet && (
                      <button
                        className="clear-selection"
                        onClick={() => setSelectedPetId(null)}
                      >
                        <Icon name="close" size={15} />
                        All pets
                      </button>
                    )}
                  </div>

                  {overdue.length > 0 && (
                    <>
                      {overdue.map((r) => (
                        <div key={r._id} className="row gap-md reminder-row-overdue">
                          <span className={`avatar reminder-icon-alert ${reminderTone(r.title)}`}>
                            <Icon name="error" size={22} filled />
                          </span>
                          <div className="min-w-0">
                            <div className="reminder-line">
                              <b>{getPetName(r)}</b> - {r.title}
                            </div>
                            <div className="reminder-detail">Was due {new Date(r.dueDate).toLocaleDateString()}</div>
                          </div>
                          <span className="reminder-when">{relativeDue(r.dueDate).label}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {upcoming.length > 0 && (
                    <>
                      {upcoming.map((r) => (
                        <div key={r._id} className="row gap-md card reminder-row-upcoming">
                          <span className="avatar icon-avatar-sm">
                            <Icon name={reminderIcon(r.title)} size={22} />
                          </span>
                          <div className="min-w-0">
                            <div className="reminder-line">
                              <b>{getPetName(r)}</b> - {r.title}
                            </div>
                          </div>
                          <span className="muted reminder-when muted-when">{relativeDue(r.dueDate).label}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {reminders.length === 0 && <p className="muted empty-reminders">No reminders yet.</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
