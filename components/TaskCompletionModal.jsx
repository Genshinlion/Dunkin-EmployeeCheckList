import { useState } from 'react';
import { useApp } from '../store/AppContext';

export default function TaskCompletionModal({ task, onClose }) {
  const { completeTask } = useApp();
  const [done, setDone] = useState(false);

  const confirm = () => {
    completeTask(task.id);
    setDone(true);
  };

  if (done) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h3>Task Complete!</h3>
            <p>Great work finishing "{task.title}"</p>
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
          <span className="modal-title">Mark as Done?</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-task-preview">
          <span className="modal-task-label">Task</span>
          <span className="modal-task-name">{task.title}</span>
        </div>
        <p className="modal-note">
          Confirm that you have completed this task. This action will be logged.
        </p>
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>Not yet</button>
          <button className="modal-btn confirm" onClick={confirm}>Yes, I'm done</button>
        </div>
      </div>
    </div>
  );
}
