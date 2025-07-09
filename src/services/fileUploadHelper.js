// This file will contain helper functions for file uploads if needed in the future.

// Helper to upload files to the backend
export async function uploadAttachments(ticketId, files) {
  const formData = new FormData();
  for (let file of files) {
    formData.append('attachments', file);
  }
  const response = await fetch(`http://localhost/php-backend/tickets/${ticketId}/messages/upload`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error('File upload failed');
  }
  return await response.json(); // { attachments: [...] }
}

// Helper to get the public URL for an uploaded attachment
export function getAttachmentUrl(filename) {
  return `http://localhost/php-backend/uploads/${filename}`;
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
