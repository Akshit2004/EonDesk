import React, { useState } from 'react';
import { FaTimes, FaTicketAlt } from 'react-icons/fa';
import { createTicketPG } from '../../../services/postgresTicketApi';
import { sendTicketConfirmationEmail } from '../../../services/emailService';
import './CreateTicketModal.css';

const CreateTicketModal = ({ onClose, onTicketCreated, customerNo, customerName }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ticketData = {
        customer_no: customerNo,
        customer_name: formData.name,
        customer_email: formData.email,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority
      };

      const result = await createTicketPG(ticketData);
      
      if (result && !result.error) {
        // Send confirmation email after successful ticket creation
        await sendTicketConfirmationEmail({
          ...ticketData,
          ticket_id: result.ticket_id || result.id || undefined
        });
        onTicketCreated(result);
      } else {
        setError(result.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-ticket-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <FaTicketAlt className="title-icon" />
            <h2>Create New Support Ticket</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-content">
            {/* Name and Email side by side */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your full name"
                  className="form-input"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Subject *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of your issue"
                className="form-input"
                disabled={loading}
              />
            </div>

            {/* Category and Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="form-select"
                  disabled={loading}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="form-select"
                  disabled={loading}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please provide detailed information about your issue..."
                className="form-textarea"
                rows={6}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
