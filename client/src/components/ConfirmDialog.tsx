import Portal from './Portal.tsx';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Portal lockScroll>
    <div className="sheet-scrim" onClick={onCancel} />
    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-label={title}>
      <h3 className="confirm-title">{title}</h3>
      <p className="muted confirm-message">{message}</p>
      <div className="row gap-sm confirm-actions">
        <button className="btn btn-outline" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
          {busy ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </div>
  </Portal>
);

export default ConfirmDialog;
