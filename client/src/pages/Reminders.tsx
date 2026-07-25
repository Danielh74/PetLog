import { useEffect, useState } from 'react';
import Icon from '../components/Icon.tsx';
import AppLayout from '../components/AppLayout.tsx';
import { getReminders, updateReminder } from '../api/reminders.ts';
import type { Reminder } from '../types/index.ts';
import { relativeDue } from '../utils/petMeta.ts';
import './Reminders.css';

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReminders()
      .then(setReminders)
      .finally(() => setLoading(false));
  }, []);

  const markDone = async (id: string) => {
    setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, isDone: true } : r)));
    await updateReminder(id, { isDone: true });
  };

  const petName = (r: Reminder) => (typeof r.pet === 'object' ? r.pet.name : '');
  const pending = reminders.filter((r) => !r.isDone);
  const done = reminders.filter((r) => r.isDone);

  return (
    <AppLayout>
      <div className="page">
        <div className="top-bar shell-topbar">
          <span className="grow topbar-title">Reminders</span>
        </div>

        <div className="scroll-area">
          <div className="page-pad reminders-list">
            {loading && (
              <div className="center spinner-wrap">
                <span className="spinner" />
              </div>
            )}

            {!loading && pending.length === 0 && done.length === 0 && (
              <p className="muted empty-state">No reminders yet — reminders you accept during onboarding will show up here.</p>
            )}

            {!loading &&
              pending.map((r) => {
                const due = relativeDue(r.dueDate);
                return (
                  <div key={r._id} className={`row gap-md reminders-row${due.overdue ? ' overdue' : ''}`}>
                    <span className={`avatar reminders-avatar${due.overdue ? ' overdue' : ''}`}>
                      <Icon name="vaccines" size={22} filled />
                    </span>
                    <div className="min-w-0">
                      <div className="reminder-line">
                        <b>{petName(r)}</b> — {r.title}
                      </div>
                      <div className="reminder-detail">{due.label}</div>
                    </div>
                    <button className="icon-btn ml-auto" onClick={() => markDone(r._id)} aria-label="Mark done">
                      <Icon name="check_circle" size={21} />
                    </button>
                  </div>
                );
              })}

            {done.length > 0 && (
              <>
                <div className="muted section-label">Completed</div>
                {done.map((r) => (
                  <div key={r._id} className="row gap-md reminders-done-row">
                    <Icon name="check_circle" size={18} filled className="icon-healthy" />
                    <span className="reminders-done-text">
                      {petName(r)} — {r.title}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reminders;
