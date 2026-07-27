export const isoToDisplay = (iso: string): string => {
    const [y, m, d] = iso.slice(0, 10).split('-');
    if (!y || !m || !d) return '';
    return `${d}/${m}/${y}`;
};

export const displayToIso = (display: string): string => {
    const [d, m, y] = display.split('/');
    if (!d || !m || !y || y.length < 4) return '';
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (Number.isNaN(date.getTime()) || date.getDate() !== Number(d) || date.getMonth() !== Number(m) - 1) return '';
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};