import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createTicketPG } from '../../services/postgresTicketApi';
import { sendTicketConfirmationEmail } from '../../services/emailService';
import './CreateTicketForm.css';

const CreateTicketForm = ({ onTicketCreated, currentUser, initialData, isEmailTicket = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || currentUser?.name || '',
    email: initialData?.email || currentUser?.email || '',
    title: initialData?.title || '',
    category: initialData?.category || 'general',
    priority: initialData?.priority || 'medium',
    description: initialData?.description || ''
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || currentUser?.name || '',
        email: initialData.email || currentUser?.email || '',
        title: initialData.title || '',
        category: initialData.category || 'general',
        priority: initialData.priority || 'medium',
        description: initialData.description || ''
      });
    }
  }, [initialData, currentUser]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { value: 'general', label: 'General Support' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    console.log('DEBUG: handleSubmit called');
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {      const ticketData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        title: formData.title.trim(),
        category: formData.category,
        priority: formData.priority,
        description: formData.description.trim()
      };

      const result = await createTicketPG(ticketData);
      console.log('DEBUG: createTicketPG result', result);
      if (result.success) {
        // Send confirmation email
        try {
          console.log('DEBUG: Calling sendTicketConfirmationEmail with', result);
          const emailResult = await sendTicketConfirmationEmail(result);
          console.log('DEBUG: sendTicketConfirmationEmail result', emailResult);

          if (emailResult.success) {
            // Show success message with email confirmation
            toast.success(
              `✅ Ticket created successfully! 
               📧 Confirmation email sent to ${formData.email}
               🎫 Ticket ID: ${result.ticketId}`, 
              {
                position: "top-right",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          } else {
            // Ticket created but email failed
            toast.warning(
              `✅ Ticket created successfully! 
               ⚠️ Failed to send confirmation email: ${emailResult.error}
               🎫 Ticket ID: ${result.ticketId}`, 
              {
                position: "top-right",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }
        } catch (emailError) {
          console.error('Email service error:', emailError);
          toast.warning(
            `✅ Ticket created successfully! 
             ⚠️ Email service unavailable
             🎫 Ticket ID: ${result.ticketId}`, 
            {
              position: "top-right",
              autoClose: 8000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }

        // Reset form
        setFormData({
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          title: '',
          category: 'general',
          priority: 'medium',
          description: ''
        });

        // Notify parent component
        if (onTicketCreated) {
          onTicketCreated(result);
        }
      } else {
        setError(result.error);
        toast.error(`Failed to create ticket: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      console.log('DEBUG: handleSubmit error', error);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-form">
      <h2>Create New Support Ticket</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="title">Subject *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Brief description of your issue"
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
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
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
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

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            placeholder="Please provide detailed information about your issue..."
            disabled={loading}
          />
        </div>        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.title.trim() || !formData.description.trim()}
            className="submit-button"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketForm;
