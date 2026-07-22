import Icon from './Icon.tsx';

const Toast = ({ message }: { message: string }) => (
  <div className="toast">
    <Icon name="check_circle" size={19} filled className="icon-inverse-brand" />
    {message}
  </div>
);

export default Toast;
