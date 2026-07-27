import { useEffect, useRef, useState } from 'react';
import { displayToIso, isoToDisplay } from '../utils/dateFormats';

interface DateInputProps {
  label?: string;
  value?: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
}

const format = (digits: string): string => {
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

const DateInput = ({ label, value, onChange, placeholder = 'DD/MM/YYYY' }: DateInputProps) => {
  const [text, setText] = useState(() => (value ? isoToDisplay(value) : ''));
  // The last ISO this field itself sent upward. Written only from the change
  // handler, read only from the effect — never touched during render.
  const emitted = useRef<string | null>(value ?? null);

  // Adopt `value` only when it did not come from us.
  //
  // A partial entry is not a valid date, so the handler emits ''. The parent
  // sets value to '', and mirroring that back cleared the box on the first
  // keystroke — the field could not be filled in at all. Ignoring our own
  // echo keeps typing intact while still following a genuine outside change.
  useEffect(() => {
    if (value === emitted.current) return;
    setText(value ? isoToDisplay(value) : '');
  }, [value]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const formatted = format(digits);
    const iso = digits.length === 8 ? displayToIso(formatted) : '';
    setText(formatted);
    emitted.current = iso;
    onChange(iso);
  };

  return (
    <div className="field">
      {label && <label>{label}</label>}
      <input
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        maxLength={10}
      />
    </div>
  );
};

export default DateInput;
