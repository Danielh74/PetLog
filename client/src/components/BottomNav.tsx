import { NavLink } from 'react-router-dom';
import Icon from './Icon.tsx';

const BottomNav = () => (
  <nav className="bottom-nav">
    <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
      <span className="nav-icon">
        <Icon name="pets" size={23} filled />
      </span>
      Pets
    </NavLink>
    <NavLink to="/reminders" className={({ isActive }) => (isActive ? 'active' : '')}>
      <span className="nav-icon">
        <Icon name="notifications" size={23} />
      </span>
      Reminders
    </NavLink>
    <NavLink to="/account" className={({ isActive }) => (isActive ? 'active' : '')}>
      <span className="nav-icon">
        <Icon name="account_circle" size={23} />
      </span>
      Account
    </NavLink>
  </nav>
);

export default BottomNav;
