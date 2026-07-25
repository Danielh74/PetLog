import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import { getPublicPet } from '../api/pets.ts';
import type { Pet } from '../types/index.ts';
import { ageFromDob, formatDate, speciesIcon, speciesLabel } from '../utils/petMeta.ts';

const SharePage = () => {
  const { token } = useParams<{ token: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getPublicPet(token)
      .then(setPet)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="app-shell center profile-center-fill">
        <span className="spinner" />
      </div>
    );
  }

  if (notFound || !pet) {
    return (
      <div className="app-shell center share-not-found">
        <Icon name="link_off" size={40} className="muted" />
        <p className="muted not-found-hint">This share link isn't valid or has been removed.</p>
      </div>
    );
  }

  const records = (pet.healthRecords ?? []).slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const vaccinations = records.filter((r) => r.type === 'vaccination');
  const others = records.filter((r) => r.type !== 'vaccination').slice(0, 5);

  const vaxStatus = (nextDueDate?: string) => {
    if (!nextDueDate) return { label: 'Current', watch: false };
    const days = Math.round((+new Date(nextDueDate) - Date.now()) / (24 * 60 * 60 * 1000));
    if (days < 0) return { label: `Overdue since ${formatDate(nextDueDate)}`, watch: true };
    if (days <= 30) return { label: `Due ${formatDate(nextDueDate)}`, watch: true };
    return { label: `Current · next ${formatDate(nextDueDate)}`, watch: false };
  };

  const dueSoonCount = vaccinations.filter((v) => vaxStatus(v.nextDueDate).watch).length;

  return (
    <div className="app-shell share-shell">
      <div className="page">
        <div className="share-header">
          <div className="row gap-sm share-lock-row">
            <Icon name="lock" size={17} />
            Read-only · shared via PetLog
          </div>
          <div className="row gap-md">
            <span className="share-avatar">
              <Icon name={speciesIcon[pet.species]} size={34} filled />
            </span>
            <div>
              <div className="share-name">{pet.name}</div>
              <div className="share-meta">
                {(pet.breed || speciesLabel[pet.species])} · {ageFromDob(pet.dob)}
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-area">
          <div className="stack gap-md share-body">
            <div className="share-section">
              <div className="row gap-sm share-section-title-row">
                <Icon name="vaccines" size={21} filled className="icon-brand" />
                <span className="share-section-title">Vaccinations</span>
                {dueSoonCount > 0 && (
                  <span className="row gap-sm share-badge-watch">
                    <span className="vax-dot watch vax-dot-sm" />
                    {dueSoonCount} due soon
                  </span>
                )}
              </div>
              {vaccinations.length === 0 && <p className="muted hint-text">No vaccinations recorded yet.</p>}
              {vaccinations.map((v) => {
                const status = vaxStatus(v.nextDueDate);
                return (
                  <div key={v._id} className="row gap-md vax-row">
                    <span className={`vax-dot${status.watch ? ' watch' : ''}`} />
                    <span className="share-record-title">{v.title}</span>
                    <span className="muted status-label">{status.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="share-section">
              <div className="row gap-sm share-section-title-row">
                <Icon name="clinical_notes" size={21} filled className="icon-brand" />
                <span className="share-section-title">Recent records</span>
              </div>
              {others.length === 0 && <p className="muted hint-text">No other records yet.</p>}
              {others.map((r) => (
                <div key={r._id} className="row gap-md share-record-row">
                  <Icon name="event_note" size={19} className="muted share-record-icon" />
                  <div className="grow">
                    <div className="share-record-title">{r.title}</div>
                    {r.notes && <div className="muted share-record-notes">{r.notes}</div>}
                  </div>
                  <span className="muted share-record-date">{formatDate(r.date)}</span>
                </div>
              ))}
            </div>

            <div className="row gap-sm muted share-footer">
              <span className="share-footer-badge">
                <Icon name="pets" size={14} filled />
              </span>
              Shared via PetLog
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
