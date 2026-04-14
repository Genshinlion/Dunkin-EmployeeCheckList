import { useState } from 'react';
import { useApp } from '../store/AppContext';
import LoginScreen from '../components/LoginScreen';
import ManagerHome from './ManagerHome';
import EmployeeHome from './EmployeeHome';
import GymTracker from './GymTracker';

export default function App() {
  const { currentUser, setCurrentUser } = useApp();
  const [page, setPage] = useState('work');

  if (!currentUser) return <LoginScreen />;

  return (
    <div>
      <nav className="nav">
        <div className="nav-brand">
          <span className="nav-dot" />
          ShiftCheck
        </div>
        <div className="nav-right">
          <button
            className={`nav-page-btn ${page === 'work' ? 'active' : ''}`}
            onClick={() => setPage('work')}
          >Work</button>
          <button
            className={`nav-page-btn gym ${page === 'gym' ? 'active' : ''}`}
            onClick={() => setPage('gym')}
          >Gym Tracker</button>
          <span className="nav-user">
            <span className="nav-role-badge" data-role={currentUser.role}>{currentUser.role}</span>
            {currentUser.name}
          </span>
          <button className="nav-logout" onClick={() => { setCurrentUser(null); setPage('work'); }}>
            Log out
          </button>
        </div>
      </nav>
      <div className="main">
        {page === 'gym'
          ? <GymTracker />
          : currentUser.role === 'manager'
            ? <ManagerHome />
            : <EmployeeHome />}
      </div>
    </div>
  );
}
