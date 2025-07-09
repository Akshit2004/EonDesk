// Centralized API base and fallback logic for Node.js and PHP backends

export const API_BASES = [
  import.meta.env.VITE_API_BASE || process.env.VITE_API_BASE || 'http://localhost:3001',
  'http://localhost/php-backend'
];

/**
 * Attempts to fetch from each backend in order until one succeeds.
 * @param {string} path - The API path (should start with /)
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 * @throws {Error} - If all backends fail
 */
export async function fetchWithFallback(path, options) {
  let lastError;
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
