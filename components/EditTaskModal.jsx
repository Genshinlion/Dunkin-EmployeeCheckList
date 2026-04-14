import { useState } from 'react';
import { useApp } from '../store/AppContext';

const CATEGORIES = ['Operations', 'Stocking', 'Facilities', 'Customer'];

export default function EditTaskModal({ task, onClose }) {
  const { nonManagers, updateTask } = useApp();
  const [form, setForm] = useState({
    title: task.title, category: task.category, assignedTo: task.assignedTo,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.title.trim()) return;
    updateTask(task.id, form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Edit Task</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="field">
            <label>Task Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Assign To</label>
            <select value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
              {nonManagers.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
          <button
            className={`modal-btn confirm ${!form.title.trim() ? 'disabled' : ''}`}
            onClick={submit}
            disabled={!form.title.trim()}
          >Save Changes</button>
        </div>
      </div>
    </div>
  );
}
