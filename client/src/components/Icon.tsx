interface IconProps {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Icon = ({ name, size = 24, filled = false, className = '', style }: IconProps) => (
  <span
    className={`material-symbols-rounded${filled ? ' filled' : ''}${className ? ` ${className}` : ''}`}
    style={{ fontSize: size, ...style }}
  >
    {name}
  </span>
);

export default Icon;
