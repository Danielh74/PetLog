import { useEffect, useState, type MouseEvent } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const onDashboard = pathname === '/dashboard';
  const [visible, setVisible] = useState<'pets' | 'reminders'>('pets');

  // Scroll spy: Pets and Reminders are bands of one page, so the lit tab has
  // to follow what is actually on screen, not just the last thing tapped.
  useEffect(() => {
    if (!onDashboard) return;
    const root = document.querySelector('.scroll-area');
    const sections = ['pets', 'reminders']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!root || sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Whichever section owns the most of the viewport wins, so the switch
        // happens at the midpoint rather than the instant an edge appears.
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setVisible(best.target.id as 'pets' | 'reminders');
      },
      { root, threshold: [0.15, 0.5, 0.85] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [onDashboard, pathname]);

  // Exactly one tab is lit for every route the shell can show:
  //   /dashboard (whichever band is on screen), /pets/*  → Pets
  //   /dashboard scrolled to the reminders band          → Reminders
  //   /account                                           → Account
  const petsActive = (onDashboard && visible === 'pets') || pathname.startsWith('/pets');
  const remindersActive = onDashboard && visible === 'reminders';

  // Tapping the tab you are already on has to still move the page. Left to
  // the router, navigating to an unchanged hash fires no location update, so
  // the dashboard's scroll effect never re-runs and the tap does nothing.
  const jumpTo = (id: 'pets' | 'reminders') => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onDashboard) return;
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setVisible(id);
    navigate(`/dashboard#${id}`, { replace: true });
  };

  // NOTE: className must stay in function form on every NavLink here. Given a
  // plain string, React Router appends its own "active" class on a path match
  // — and since both dashboard links share the /dashboard path, that lit them
  // both at once regardless of which band was showing.
  return (
    <nav className="bottom-nav">
      <div className="nav-brand">
        <span className="avatar nav-brand-icon">
          <Icon name="pets" size={20} filled />
        </span>
        PetLog
      </div>

      <NavLink to="/dashboard#pets" className={() => (petsActive ? 'active' : '')} onClick={jumpTo('pets')}>
        <span className="nav-icon">
          <Icon name="pets" size={23} filled />
        </span>
        Pets
      </NavLink>

      <NavLink
        to="/dashboard#reminders"
        className={() => (remindersActive ? 'active' : '')}
        onClick={jumpTo('reminders')}
      >
        <span className="nav-icon">
          <Icon name="notifications" size={23} />
        </span>
        Reminders
      </NavLink>

      {/* Desktop puts the account behind the user chip at the foot of the
          sidebar, so this row would be a second door to the same place. The
          bottom bar has no chip, so it keeps the tab. */}
      <NavLink to="/account" className={({ isActive }) => `nav-account-tab${isActive ? ' active' : ''}`}>
        <span className="nav-icon">
          <Icon name="account_circle" size={23} />
        </span>
        Account
      </NavLink>

      <div className="nav-spacer" />

      {appUser && (
        <NavLink to="/account" className={({ isActive }) => `row gap-md nav-user-chip${isActive ? ' active' : ''}`}>
          <span className="avatar nav-user-avatar">{initials(appUser.name)}</span>
          <div className="min-w-0">
            <div className="nav-user-name">{appUser.name}</div>
            <div className="nav-user-email">{appUser.email}</div>
          </div>
          <Icon name="chevron_right" size={18} className="nav-user-chevron" />
        </NavLink>
      )}
    </nav>
  );
};

export default NavBar;
