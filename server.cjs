const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'https://eon-desk.vercel.app', 'https://eondesk.vercel.app'],
  credentials: true
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://support_09g6_user:dU1y70gmIhLzTkfKOaLJELTcF7XEHCLL@dpg-d1lqklbe5dus7381uo7g-a.oregon-postgres.render.com/support_09g6',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter for allowed types (pdf, excel, images, etc.)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/csv'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Excel, images, and CSV are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Test database connection to Render
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to Render database:', err.message);
  } else {
    console.log('Connected to Render PostgreSQL database');
    release();
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Eon Support Interface API is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Get all tickets
app.get('/tickets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ticket ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new ticket
app.post('/tickets', async (req, res) => {
  const {
    ticket_id, title, category, priority, status, created_by,
    customer_name, customer_email, customer_no, assigned_agent, assigned_agent_name, description // add customer_no
  } = req.body;
  
  try {
    console.log('Creating ticket:', ticket_id);
    
    // Generate ticket_id if not provided
    const finalTicketId = ticket_id || `TKT-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    const result = await pool.query(
      `INSERT INTO ticket (ticket_id, title, category, priority, status, created_by, customer_name, customer_email, customer_no, assigned_agent, assigned_agent_name, description, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW()) RETURNING *`,
      [finalTicketId, title || 'Support Request', category || 'general', priority || 'medium', status || 'open', created_by, customer_name, customer_email, customer_no, assigned_agent, assigned_agent_name, description]
    );
    
    console.log('Created ticket:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating ticket:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all messages for a ticket
app.get('/tickets/:ticket_id/messages', async (req, res) => {
  try {
    console.log('Fetching messages for ticket:', req.params.ticket_id);
    const result = await pool.query(
      'SELECT * FROM message WHERE ticket_id = $1 ORDER BY timestamp ASC',
      [req.params.ticket_id]
    );
    console.log('Found messages:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update ticket status
app.put('/tickets/:ticket_id/status', async (req, res) => {
  const { status } = req.body;
  try {
    console.log('Updating ticket status:', req.params.ticket_id, 'to', status);
    const result = await pool.query(
      'UPDATE ticket SET status = $1, updated_at = NOW() WHERE ticket_id = $2 RETURNING *',
      [status, req.params.ticket_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    console.log('Updated ticket:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating ticket status:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create a new message for a ticket
app.post('/tickets/:ticket_id/messages', async (req, res) => {
  const { content, sender_id, sender_type, sender_name, message_type, attachments, read_by, reply_to } = req.body;
  try {
    console.log('Creating message for ticket:', req.params.ticket_id);
    const result = await pool.query(
      `INSERT INTO message (ticket_id, content, sender_id, sender_type, sender_name, message_type, attachments, read_by, reply_to, timestamp)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
      [req.params.ticket_id, content, sender_id, sender_type, sender_name, message_type || 'public', JSON.stringify(attachments || []), JSON.stringify(read_by || []), reply_to]
    );
    console.log('Created message:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating message:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to upload attachments for a message
app.post('/tickets/:ticket_id/messages/upload', upload.array('attachments', 5), async (req, res) => {
  // Accept up to 5 files per message
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    // Return file info to frontend for further message creation
    const fileInfos = files.map(file => ({
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    }));
    res.json({ attachments: fileInfos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, password]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await pool.query(
      'SELECT id, email FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer login verification
app.post('/customer-login', async (req, res) => {
  const { customer_no, password } = req.body;
  if (!customer_no || !password) {
    return res.status(400).json({ error: 'Customer No. and password are required' });
  }
  try {
    const result = await pool.query(
      'SELECT id, customer_no FROM customer WHERE customer_no = $1 AND password = $2',
      [customer_no, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ customer: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tickets for a customer_no
app.get('/tickets/customer/:customer_no', async (req, res) => {
  try {
    const { customer_no } = req.params;
    const result = await pool.query(
      'SELECT * FROM ticket WHERE customer_no = $1 ORDER BY created_at DESC',
      [customer_no]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});