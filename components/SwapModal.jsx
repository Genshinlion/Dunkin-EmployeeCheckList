import { useState } from 'react';
import { useApp } from '../store/AppContext';

export default function SwapModal({ task, onClose }) {
  const { currentUser, nonManagers, addSwap } = useApp();
  const others = nonManagers.filter(e => e.id !== currentUser.id);
  const [toId,   setToId]   = useState(others[0]?.id || '');
  const [reason, setReason] = useState('');
  const [done,   setDone]   = useState(false);

  const submit = () => {
    addSwap({ taskId: task.id, fromId: currentUser.id, toId, reason });
    setDone(true);
  };

  if (done) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">🔄</div>
            <h3>Swap Requested</h3>
            <p>Your swap request has been submitted and is pending approval.</p>
            <button className="modal-btn confirm" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Request Swap</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-task-preview">
          <span className="modal-task-label">Task</span>
          <span className="modal-task-name">{task.title}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="field">
            <label>Swap With</label>
            <select value={toId} onChange={e => setToId(e.target.value)}>
              {others.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Reason (optional)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Briefly explain why..."
            />
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn confirm" onClick={submit} disabled={!toId}>
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
