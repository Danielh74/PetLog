import { useEffect, useRef, useState } from 'react';

interface DateInputProps {
  label?: string;
  value?: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
}

const isoToDisplay = (iso: string): string => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
};

const displayToIso = (display: string): string => {
  const [d, m, y] = display.split('/');
  if (!d || !m || !y || y.length < 4) return '';
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime()) || date.getDate() !== Number(d) || date.getMonth() !== Number(m) - 1) return '';
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

const format = (digits: string): string => {
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

const DateInput = ({ label, value, onChange, placeholder = 'DD/MM/YYYY' }: DateInputProps) => {
  const [text, setText] = useState(() => (value ? isoToDisplay(value) : ''));
  const textRef = useRef(text);
  textRef.current = text;

  // Only adopt the prop when it disagrees with what is already typed.
  //
  // A partial entry emits onChange('') because it is not yet a valid date, so
  // the parent's value becomes ''. Blindly mirroring that back cleared the
  // box on the first keystroke and made the field impossible to fill in.
  useEffect(() => {
    if (value === displayToIso(textRef.current)) return;
    setText(value ? isoToDisplay(value) : '');
  }, [value]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const formatted = format(digits);
    setText(formatted);
    onChange(digits.length === 8 ? displayToIso(formatted) : '');
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
