import { logEvent } from 'firebase/analytics';
import { analytics } from './config';

// Log custom events
export const trackEvent = (eventName, parameters = {}) => {
  try {
    logEvent(analytics, eventName, parameters);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Common event tracking functions
export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
};

export const trackUserSignup = (method = 'email') => {
  trackEvent('sign_up', {
    method: method
  });
};

export const trackUserLogin = (method = 'email') => {
  trackEvent('login', {
    method: method
  });
};

export const trackTicketCreated = (ticketType) => {
  trackEvent('ticket_created', {
    ticket_type: ticketType
  });
};

export const trackTicketResolved = (ticketId, resolutionTime) => {
  trackEvent('ticket_resolved', {
    ticket_id: ticketId,
    resolution_time: resolutionTime
  });
};

export const trackSearchQuery = (searchTerm, resultsCount) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount
  });
};
