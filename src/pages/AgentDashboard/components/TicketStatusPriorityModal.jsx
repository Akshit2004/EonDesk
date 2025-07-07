import React, { useState } from 'react';
import './TicketStatusPriorityModal.css';

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'waiting_for_customer', label: 'Waiting for Customer' },
  { value: 'waiting_for_agent', label: 'Waiting for Agent' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function TicketStatusPriorityModal({
  isOpen,
  onClose,
  ticket,
  onSave
}) {
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);

  const handleSave = () => {
    onSave({ status, priority });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Edit Status & Priority</h2>
        <div className="modal-field">
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="modal-field">
          <label>Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            {priorityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave} className="save-btn">Save</button>
        </div>
      </div>
    </div>
  );
}
