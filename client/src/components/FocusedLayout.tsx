import type { ReactNode } from 'react';
import Icon from './Icon.tsx';
import './FocusedLayout.css';

interface AsideItem {
  icon: string;
  text: string;
}

interface FocusedLayoutProps {
  children: ReactNode;
  asideTitle: string;
  asideItems: AsideItem[];
}

const FocusedLayout = ({ children, asideTitle, asideItems }: FocusedLayoutProps) => (
  <div className="focused-wrap">
    <div className="focused-panel">{children}</div>
    <div className="focused-aside">
      <div className="focused-aside-title">{asideTitle}</div>
      {asideItems.map((item, i) => (
        <div key={i} className="row gap-md focused-aside-item">
          <Icon name={item.icon} size={19} filled className="focused-aside-icon" />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  </div>
);

export default FocusedLayout;
