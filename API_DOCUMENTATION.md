# Eon Support Interface – API & Integration Documentation

## Centralized API Logic

All API calls in the frontend use a centralized fallback mechanism defined in `src/services/apiBase.js`:

- **API_BASES**: An array of backend URLs (Node.js and PHP). The app tries each in order until one responds.
- **fetchWithFallback(path, options)**: Use this function for all API calls. It tries each backend and returns the first successful response.

### Usage Example
```js
import { fetchWithFallback } from './services/apiBase';
const response = await fetchWithFallback('/login', { method: 'POST', ... });
```

## Backend Endpoints

### Node.js Backend (Express, default: `http://localhost:3001`)
- `/login` (POST): Agent login
- `/customer-login` (POST): Customer login
- `/tickets` (GET/POST): List or create tickets
- `/tickets/:ticket_id/messages` (GET/POST): Get/add messages for a ticket
- `/tickets/:ticket_id/messages/upload` (POST): Upload attachments
- `/tickets/customer/:customer_no` (GET): Get all tickets for a customer
- `/uploads/:filename` (GET): Download attachments

### PHP Backend (default: `http://localhost/php-backend`)
- Same endpoints as above, but under the PHP backend root.

## How Fallback Works
- The frontend tries the Node backend first (or the URL in `VITE_API_BASE` if set).
- If the request fails, it tries the PHP backend.
- No code changes are needed to switch backends—just start the server you want.

## Environment Variables
- `VITE_API_BASE`: (optional) Set this in your `.env` file to override the default backend URL.

## External APIs Used

### EmailJS
- Used for sending emails from the frontend.
- Configuration is in `src/services/emailService.js`.
- **Setup:**
  1. Create an account at [EmailJS](https://www.emailjs.com/).
  2. Get your service ID, template ID, and public key.
  3. Add them to your `.env` file as `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`.
  4. The app will initialize EmailJS on startup.

### Gmail API (for agent email dashboard)
- Used for fetching and managing support emails.
- Configuration is in `src/services/gmailService.js`.
- **Setup:**
  1. Create a Google Cloud project and enable the Gmail API.
  2. Create OAuth credentials and get your client ID, client secret, and refresh token.
  3. Add them to your `.env` file as `VITE_GMAIL_CLIENT_ID`, `VITE_GMAIL_CLIENT_SECRET`, `VITE_GMAIL_REFRESH_TOKEN`.
  4. Set your support email in `src/services/emailConfig.js` as `SUPPORT_EMAIL`.
  5. The app will use these to fetch and send emails.

## Adding a New API Call
1. Import `fetchWithFallback` from `src/services/apiBase.js`.
2. Use it for your API call, e.g.:
   ```js
   const res = await fetchWithFallback('/tickets', { method: 'GET' });
   ```
3. Handle errors and loading states as usual.

## File Uploads & Attachments
- Use `uploadAttachments` and `getAttachmentUrl` from `src/services/fileUploadHelper.js`.
- These helpers use the same fallback logic and will work with both backends.

## Project Structure
- All API logic is in `src/services/`.
- UI and page logic is in `src/pages/` and `src/components/`.
- Environment variables are managed via `.env` files.

## Troubleshooting
- If an API call fails, check that at least one backend server is running.
- For external APIs (EmailJS, Gmail), ensure your credentials are correct and environment variables are set.

---

For further details, see inline comments in each service file or ask for specific integration help.
