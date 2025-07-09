import { API_BASES } from './apiBase';

function getFirstWorkingBase(path = '/uploads') {
  // Try to find which backend is serving uploads
  for (const base of API_BASES) {
    if (base.includes('3001')) return base; // Prefer Node if running
  }
  return API_BASES[1]; // fallback to PHP
}

export async function uploadAttachments(ticketId, files) {
  const formData = new FormData();
  for (let file of files) {
    formData.append('attachments', file);
  }
  let lastError;
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}/tickets/${ticketId}/messages/upload`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('File upload failed');
      return await response.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export function getAttachmentUrl(filename) {
  const base = getFirstWorkingBase();
  return `${base}/uploads/${filename}`;
}

export function isAllowedFileType(file) {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/csv'
  ];
  return allowedTypes.includes(file.type);
}
