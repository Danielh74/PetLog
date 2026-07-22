import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const Account = () => {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="page">
        <div className="top-bar">
          <span className="grow topbar-title">Account</span>
        </div>
        <div className="scroll-area">
          <div className="page-pad center account-page">
            <span className="avatar account-avatar">{appUser?.name?.[0]?.toUpperCase() ?? '?'}</span>
            <h2 className="account-name">{appUser?.name ?? 'Loading…'}</h2>
            <p className="muted account-email">{appUser?.email}</p>

            <button className="btn btn-outline account-logout" onClick={handleLogout}>
              <Icon name="logout" size={20} />
              Log out
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

export default Account;
