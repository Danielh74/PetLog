import { NavLink } from 'react-router-dom';
import Icon from './Icon.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const NavBar = () => {
  const { appUser } = useAuth();

  return (
    <nav className="bottom-nav">
      <div className="nav-brand">
        <span className="avatar nav-brand-icon">
          <Icon name="pets" size={20} filled />
        </span>
        PetLog
      </div>
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
      <div className="nav-spacer" />
      {appUser && (
        <div className="row gap-md nav-user-chip">
          <span className="avatar nav-user-avatar">{initials(appUser.name)}</span>
          <div className="min-w-0">
            <div className="nav-user-name">{appUser.name}</div>
            <div className="nav-user-email">{appUser.email}</div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
