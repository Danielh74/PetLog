import { useState } from 'react'
import Form from './Form';
import DateInput from '../DateInput';
import type { HealthRecord, HealthRecordType } from '../../types';
import type { CreateRecordInput } from '../../api/records';

const TYPE_META: Record<HealthRecordType, { icon: string; label: string; tone: string }> = {
    vaccination: { icon: 'vaccines', label: 'Vaccination', tone: 'vax' },
    vet_visit: { icon: 'stethoscope', label: 'Vet visit', tone: 'vet' },
    medication: { icon: 'medication', label: 'Medication', tone: 'med' },
    weight: { icon: 'monitor_weight', label: 'Weight', tone: 'wt' },
    grooming: { icon: 'content_cut', label: 'Grooming', tone: 'groom' },
    other: { icon: 'event_note', label: 'Other', tone: 'other' },
};

function AddRecordForm({
    type,
    initial,
    onCancel,
    onSaved,
}: {
    type: HealthRecordType;
    initial?: HealthRecord;
    onCancel: () => void;
    onSaved: (input: CreateRecordInput) => void;
}) {
    const meta = TYPE_META[type];
    const [title, setTitle] = useState(initial?.title ?? meta.label);
    const [date, setDate] = useState(initial ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState(initial?.notes ?? '');
    const [weight, setWeight] = useState(initial?.weight != null ? String(initial.weight) : '');
    const [nextDueDate, setNextDueDate] = useState(initial?.nextDueDate ? initial.nextDueDate.slice(0, 10) : '');

    const submit = () => {
        onSaved({
            type,
            title: title.trim() || meta.label,
            date: new Date(date).toISOString(),
            ...(notes && { notes }),
            // The schema wants a positive number. Number('4.5kg') is NaN and
            // Number('0') is 0 — both come back 400, so only send a real reading.
            ...(type === 'weight' && Number(weight) > 0 && { weight: Number(weight) }),
            ...(nextDueDate && { nextDueDate: new Date(nextDueDate).toISOString() }),
        });
    };

    return (
        <Form
            formTitle={initial ? `Edit ${meta.label.toLowerCase()}` : meta.label}
            initial={initial}
            onCancel={onCancel}
            onSave={submit}
        >
            <div>
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
                {/* Same action pair as Edit pet: secondary back to the type list (or
            cancel outright when editing), primary to commit. */}
            </div>
        </Form>
    );
}

export default AddRecordForm