import { useApp } from "../store/AppContext";

export default function LoginScreen() {
  const { employees, setCurrentUser } = useApp();

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-brand">
          <span className="nav-dot large" />
          ShiftCheck
        </div>
        <p className="login-sub">Select your profile to continue</p>

        <div className="login-section-label">Managers</div>
        <ul className="profile-list">
          {employees.filter(e => e.role === "manager").map(emp => (
            <li key={emp.id}>
              <button className="profile-btn manager" onClick={() => setCurrentUser(emp)}>
                <span className="profile-avatar">{emp.name[0]}</span>
                <div className="profile-info">
                  <span className="profile-name">{emp.name}</span>
                  <span className="profile-meta">Manager · Can assign & view all tasks</span>
                </div>
                <span className="profile-arrow">→</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="login-section-label" style={{marginTop:"20px"}}>Employees</div>
        <ul className="profile-list">
          {employees.filter(e => e.role === "employee").map(emp => (
            <li key={emp.id}>
              <button className="profile-btn" onClick={() => setCurrentUser(emp)}>
                <span className="profile-avatar">{emp.name[0]}</span>
                <div className="profile-info">
                  <span className="profile-name">{emp.name}</span>
                  <span className="profile-meta">{emp.phone}</span>
                </div>
                <span className="profile-arrow">→</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="login-note">
          In production, this screen is replaced with Paycor OAuth login.
        </p>
      </div>
    </div>
  );
}
