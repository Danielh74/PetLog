import Icon from './Icon.tsx';
import Portal from './Portal.tsx';

/**
 * Sits at the top of the window. It used to be pinned to the bottom, where on
 * mobile it landed on top of the bottom nav bar, and it was rendered inside
 * the transformed `.page`, so `position: fixed` resolved against the page
 * rather than the viewport and the message could end up off-screen entirely.
 */
const Toast = ({ message }: { message: string }) => (
  <Portal>
    <div className="toast" role="status" aria-live="polite">
      <Icon name="check_circle" size={19} filled className="icon-inverse-brand" />
      {message}
    </div>
  </Portal>
);

export default Toast;
