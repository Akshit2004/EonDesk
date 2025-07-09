// This file will contain helper functions for file uploads if needed in the future.

const API_BASES = [
  import.meta.env.VITE_API_BASE || process.env.VITE_API_BASE || 'http://localhost:3001',
  'http://localhost/php-backend'
];

function getFirstWorkingBase(path = '/uploads') {
  // Try to find which backend is serving uploads
  for (const base of API_BASES) {
    // This is a simple check; in production, you may want to cache or check availability
    if (base.includes('3001')) return base; // Prefer Node if running
  }
  return API_BASES[1]; // fallback to PHP
}

// Helper to upload files to the backend
export async function uploadAttachments(ticketId, files) {
  const formData = new FormData();
  for (let file of files) {
    formData.append('attachments', file);
  }
  // Try both backends for upload
  let lastError;
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}/tickets/${ticketId}/messages/upload`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('File upload failed');
      return await response.json(); // { attachments: [...] }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// Helper to get the public URL for an uploaded attachment
export function getAttachmentUrl(filename) {
  // Try to generate the correct URL for attachments
  const base = getFirstWorkingBase();
  return `${base}/uploads/${filename}`;
}

// Helper to check allowed file types (for frontend validation)
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
