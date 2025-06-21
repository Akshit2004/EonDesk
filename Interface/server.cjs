const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres', // your postgres username
  host: 'localhost',
  database: 'support',
  password: 'Akshit@123', // replace with your postgres password
  port: 5432,
});

// Test database connection and create sample data
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    
    // Create some sample data if tables are empty
    try {
      const ticketCheck = await client.query('SELECT COUNT(*) FROM ticket');
      const messageCheck = await client.query('SELECT COUNT(*) FROM message');
      
      if (parseInt(ticketCheck.rows[0].count) === 0) {
        console.log('Creating sample ticket data...');
        await client.query(`
          INSERT INTO ticket (ticket_id, title, category, priority, status, created_by, customer_name, customer_email, assigned_agent, assigned_agent_name, created_at, updated_at)
          VALUES 
            ('TKT-MC5ZWMHS-P4GUB', 'Sample Support Issue', 'technical', 'medium', 'open', 'customer@example.com', 'John Doe', 'customer@example.com', NULL, NULL, NOW(), NOW()),
            ('TKT-SAMPLE-ABCDE', 'Another Test Issue', 'general', 'low', 'open', 'user@test.com', 'Jane Smith', 'user@test.com', NULL, NULL, NOW(), NOW())
        `);
      }
      
      if (parseInt(messageCheck.rows[0].count) === 0) {
        console.log('Creating sample message data...');
        await client.query(`
          INSERT INTO message (ticket_id, content, sender_id, sender_type, sender_name, message_type, timestamp, attachments, read_by, reply_to)
          VALUES 
            ('TKT-MC5ZWMHS-P4GUB', 'This is the initial message for the ticket. I am having issues with the system.', 'customer@example.com', 'customer', 'John Doe', 'public', NOW(), '[]', '[]', NULL),
            ('TKT-MC5ZWMHS-P4GUB', 'Thank you for contacting support. We are looking into your issue.', 'agent@company.com', 'agent', 'Support Agent', 'public', NOW(), '[]', '[]', NULL),
            ('TKT-SAMPLE-ABCDE', 'I need help with general setup.', 'user@test.com', 'customer', 'Jane Smith', 'public', NOW(), '[]', '[]', NULL)
        `);
      }
      
      console.log('Sample data setup complete');
    } catch (sampleError) {
      console.log('Sample data creation skipped (tables might already have data):', sampleError.message);
    }
    
    release();
  }
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
    customer_name, customer_email, assigned_agent, assigned_agent_name, description
  } = req.body;
  
  try {
    console.log('Creating ticket:', ticket_id);
    
    // Generate ticket_id if not provided
    const finalTicketId = ticket_id || `TKT-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    const result = await pool.query(
      `INSERT INTO ticket (ticket_id, title, category, priority, status, created_by, customer_name, customer_email, assigned_agent, assigned_agent_name, description, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW()) RETURNING *`,
      [finalTicketId, title || 'Support Request', category || 'general', priority || 'medium', status || 'open', created_by, customer_name, customer_email, assigned_agent, assigned_agent_name, description]
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});