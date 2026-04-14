import { useState, useEffect } from 'react';

const EXERCISE_TYPES = [
  'Treadmill', 'Elliptical', 'Stationary Bike', 'Outdoor Run',
  'Outdoor Walk', 'Swimming', 'Jump Rope', 'HIIT Cardio',
  'Rowing Machine', 'Stair Climber', 'Other',
];

const WORKOUTS_KEY = 'gym_workouts';
const CONFIG_KEY   = 'gym_config';

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

const DEFAULT_CONFIG = { phone: '', times: [] };
const TABS = ['Reminders', 'Log Workout', 'History'];

export default function GymTracker() {
  const [tab,      setTab]      = useState(0);
  const [workouts, setWorkouts] = useState(() => loadJSON(WORKOUTS_KEY, []));
  const [config,   setConfig]   = useState(() => loadJSON(CONFIG_KEY, DEFAULT_CONFIG));

  useEffect(() => { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); }, [config]);

  const addWorkout = (w) => {
    const updated = [w, ...workouts];
    setWorkouts(updated);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(updated));
  };

  const deleteWorkout = (id) => {
    const updated = workouts.filter(w => w.id !== id);
    setWorkouts(updated);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(updated));
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="shift-badge gym">GYM TRACKER</div>
        <h1 className="screen-title">My Fitness</h1>
        <p className="screen-sub">
          SMS reminders straight to your Messages app · Log cardio · Track progress
        </p>
      </div>

      <div className="tab-bar">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`tab-btn ${tab === i ? 'active' : ''}`}
            onClick={() => setTab(i)}
          >{t}</button>
        ))}
        <span className="gym-streak-badge">
          {workouts.length} session{workouts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {tab === 0 && <RemindersTab config={config} setConfig={setConfig} />}
      {tab === 1 && <LogWorkoutTab onSave={addWorkout} />}
      {tab === 2 && <HistoryTab workouts={workouts} onDelete={deleteWorkout} />}
    </div>
  );
}

// ── Reminders Tab ─────────────────────────────────────────────────────────────
function RemindersTab({ config, setConfig }) {
  const [newTime,    setNewTime]    = useState('');
  const [testStatus, setTestStatus] = useState(null);
  const [sending,    setSending]    = useState(false);

  const setPhone = (v) => setConfig(c => ({ ...c, phone: v }));

  const addTime = () => {
    if (!newTime || config.times.includes(newTime)) return;
    setConfig(c => ({ ...c, times: [...c.times, newTime].sort() }));
    setNewTime('');
  };

  const removeTime = (t) => setConfig(c => ({ ...c, times: c.times.filter(x => x !== t) }));

  const sendTest = async () => {
    if (!config.phone) {
      setTestStatus({ type: 'error', msg: 'Enter your phone number first.' });
      return;
    }
    setSending(true);
    setTestStatus(null);
    try {
      const res  = await fetch('/.netlify/functions/gym-reminder?test=true', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: config.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestStatus({
          type: 'success',
          msg:  `Text sent! Quota remaining today: ${data.quotaRemaining}. Message: "${data.message}"`,
        });
      } else {
        setTestStatus({ type: 'error', msg: data.error || 'Something went wrong.' });
      }
    } catch {
      setTestStatus({ type: 'error', msg: 'Could not reach server. App must be deployed to Netlify.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="gym-section">

      {/* How it works */}
      <div className="gym-free-banner">
        <span className="gym-free-badge">FREE SMS</span>
        <p>
          Messages go straight to your iPhone or Android Messages app via{' '}
          <strong>TextBelt</strong>. The free key sends <strong>1 text/day</strong> with
          no account or credit card. Need more? Buy credits at $0.01/text at textbelt.com.
        </p>
      </div>

      {/* Phone number */}
      <div className="card">
        <h2 className="section-label">Your Phone Number</h2>
        <div className="field">
          <label>Mobile number (with country code)</label>
          <input
            type="tel"
            value={config.phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+15551234567"
          />
        </div>
        <p className="gym-hint" style={{ marginTop: '8px' }}>
          Include country code — e.g. <strong>+1</strong> for US/Canada,{' '}
          <strong>+44</strong> for UK
        </p>
      </div>

      {/* Scheduled reminder times */}
      <div className="card">
        <h2 className="section-label">Reminder Times</h2>
        <p className="gym-hint" style={{ marginBottom: '14px' }}>
          Add the times you want to receive a text. Times are in UTC — use a converter
          if needed (e.g. 12:00 UTC = 8:00 AM EST). A motivational message is randomly
          picked each time; add a Gemini key below for AI-generated ones.
        </p>

        {config.times.length === 0 && (
          <div className="empty-state" style={{ padding: '20px 0 16px' }}>
            <div className="empty-icon" style={{ fontSize: '24px' }}>⏰</div>
            <p style={{ fontSize: '13px' }}>No reminder times set yet</p>
          </div>
        )}

        <ul className="reminder-time-list">
          {config.times.map(t => {
            const [h, m] = t.split(':');
            const d = new Date();
            d.setHours(parseInt(h, 10), parseInt(m, 10));
            const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <li key={t} className="reminder-time-row">
                <span className="reminder-time-clock">{label}</span>
                <span className="reminder-time-raw">{t} UTC</span>
                <button className="reminder-time-del" onClick={() => removeTime(t)} title="Remove">×</button>
              </li>
            );
          })}
        </ul>

        <div className="reminder-add-row">
          <input
            type="time"
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
            className="time-input"
          />
          <button className="tab-action-btn" onClick={addTime} disabled={!newTime}>
            + Add Time
          </button>
        </div>
      </div>

      {/* Test button */}
      <div className="card">
        <h2 className="section-label">Test — Send a Text Right Now</h2>
        <p className="gym-hint" style={{ marginBottom: '14px' }}>
          Sends one real SMS to your phone immediately so you can confirm everything works.
          Uses your daily free quota (1/day with the free key).
        </p>
        <button className="gym-test-btn" onClick={sendTest} disabled={sending}>
          {sending ? 'Sending…' : 'Send Test Text Now'}
        </button>
        {testStatus && (
          <div className={`gym-status ${testStatus.type}`}>{testStatus.msg}</div>
        )}
      </div>

      {/* Netlify setup */}
      <div className="card">
        <h2 className="section-label">Netlify Setup (One Time)</h2>
        <p className="gym-hint" style={{ marginBottom: '14px' }}>
          Add these in your Netlify dashboard under{' '}
          <strong>Site Settings → Environment Variables</strong>. The cron job runs
          every minute and fires when the clock matches one of your times.
        </p>

        <div className="setup-steps" style={{ marginBottom: '16px' }}>
          <div className="setup-step">
            <span className="setup-num">1</span>
            <div>
              <strong>No account needed for free tier</strong> — just set{' '}
              <code className="env-key">TEXTBELT_KEY</code> to{' '}
              <code className="env-val">textbelt</code> for 1 free SMS/day.
              For more sends, buy a key at textbelt.com and paste it here.
            </div>
          </div>
          <div className="setup-step">
            <span className="setup-num">2</span>
            <div>
              <strong>AI messages are optional</strong> — without a Gemini key the
              reminder still sends, it just picks from 40 built-in motivational messages.
              Get a free Gemini key at{' '}
              <strong>aistudio.google.com</strong> (1500 requests/day free).
            </div>
          </div>
        </div>

        <div className="env-list">
          {[
            ['GYM_PHONE',          config.phone || '+15551234567',          'Your mobile number'],
            ['GYM_REMINDER_TIMES', config.times.join(',') || '12:00,23:00', 'UTC times, comma-separated'],
            ['TEXTBELT_KEY',       'textbelt',                              'Free: 1/day · Paid: your key'],
            ['GEMINI_API_KEY',     'optional — free at aistudio.google.com','AI-generated messages'],
          ].map(([k, v, desc]) => (
            <div key={k} className="env-row">
              <code className="env-key">{k}</code>
              <code className="env-val">{v}</code>
              <span className="env-desc">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Log Workout Tab ───────────────────────────────────────────────────────────
const BLANK = {
  date: '', type: 'Treadmill', duration: '',
  distance: '', calories: '', avgHr: '', notes: '',
};

function getDefaultDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function LogWorkoutTab({ onSave }) {
  const [form,  setForm]  = useState({ ...BLANK, date: getDefaultDate() });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.duration) return;
    onSave({ ...form, id: `w${Date.now()}`, loggedAt: new Date().toISOString() });
    setForm({ ...BLANK, date: getDefaultDate() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  if (saved) {
    return (
      <div className="card">
        <div className="modal-success">
          <div className="modal-success-icon">🏃</div>
          <h3>Workout Logged!</h3>
          <p>Keep it up — consistency is everything.</p>
          <button className="modal-btn confirm gym" onClick={() => setSaved(false)}>
            Log Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-label">Cardio Session</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        <div className="field-row">
          <div className="field">
            <label>Date &amp; Time</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Exercise Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              {EXERCISE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Duration (minutes) *</label>
            <input
              type="number" min="1"
              value={form.duration}
              onChange={e => set('duration', e.target.value)}
              placeholder="30"
            />
          </div>
          <div className="field">
            <label>Distance (miles)</label>
            <input
              type="number" step="0.1" min="0"
              value={form.distance}
              onChange={e => set('distance', e.target.value)}
              placeholder="2.5"
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Calories Burned</label>
            <input
              type="number" min="0"
              value={form.calories}
              onChange={e => set('calories', e.target.value)}
              placeholder="300"
            />
          </div>
          <div className="field">
            <label>Avg Heart Rate (bpm)</label>
            <input
              type="number" min="0"
              value={form.avgHr}
              onChange={e => set('avgHr', e.target.value)}
              placeholder="145"
            />
          </div>
        </div>

        <div className="field">
          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            placeholder="How did it feel? Any personal records?"
          />
        </div>
      </div>

      <div className="modal-footer" style={{ marginTop: '20px' }}>
        <button className="modal-btn cancel" onClick={() => setForm({ ...BLANK, date: getDefaultDate() })}>
          Clear
        </button>
        <button
          className={`modal-btn confirm gym ${!form.duration ? 'disabled' : ''}`}
          onClick={submit}
          disabled={!form.duration}
        >
          Save Workout
        </button>
      </div>
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab({ workouts, onDelete }) {
  const [filter, setFilter] = useState('All');

  const types    = ['All', ...new Set(workouts.map(w => w.type))];
  const filtered = filter === 'All' ? workouts : workouts.filter(w => w.type === filter);

  const totalMin  = workouts.reduce((s, w) => s + (Number(w.duration) || 0), 0);
  const totalCal  = workouts.reduce((s, w) => s + (Number(w.calories) || 0), 0);
  const totalMile = workouts.reduce((s, w) => s + (Number(w.distance) || 0), 0);

  return (
    <div className="gym-section">
      <div className="gym-stats-row">
        <div className="gym-stat-card">
          <span className="gym-stat-num">{workouts.length}</span>
          <span className="gym-stat-label">Sessions</span>
        </div>
        <div className="gym-stat-card">
          <span className="gym-stat-num">{Math.round((totalMin / 60) * 10) / 10}h</span>
          <span className="gym-stat-label">Total Time</span>
        </div>
        <div className="gym-stat-card">
          <span className="gym-stat-num">{totalCal.toLocaleString()}</span>
          <span className="gym-stat-label">Calories</span>
        </div>
        <div className="gym-stat-card">
          <span className="gym-stat-num">{Math.round(totalMile * 10) / 10}</span>
          <span className="gym-stat-label">Miles</span>
        </div>
      </div>

      {workouts.length > 1 && (
        <div className="gym-filter-row">
          {types.map(t => (
            <button
              key={t}
              className={`gym-filter-btn ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
            >{t}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <p>No workouts logged yet. Go crush a session and come back to track it!</p>
        </div>
      ) : (
        <ul className="workout-list">
          {filtered.map(w => (
            <WorkoutCard key={w.id} workout={w} onDelete={() => onDelete(w.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function WorkoutCard({ workout: w, onDelete }) {
  const date    = new Date(w.date);
  const dateStr = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <li className="workout-card">
      <div className="workout-card-top">
        <span className="workout-type-badge">{w.type}</span>
        <span className="workout-date">{dateStr} · {timeStr}</span>
        <button className="workout-del" onClick={onDelete} title="Delete">×</button>
      </div>
      <div className="workout-stats">
        <span className="workout-stat"><strong>{w.duration}</strong> min</span>
        {w.distance && <span className="workout-stat"><strong>{w.distance}</strong> mi</span>}
        {w.calories  && <span className="workout-stat"><strong>{w.calories}</strong> cal</span>}
        {w.avgHr     && <span className="workout-stat"><strong>{w.avgHr}</strong> bpm avg</span>}
      </div>
      {w.notes && <div className="workout-notes">{w.notes}</div>}
    </li>
  );
}
