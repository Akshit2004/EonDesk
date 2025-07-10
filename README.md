# 🎯 Eon Support Interface

## 📖 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Third-Party Integrations](#third-party-integrations)
- [Database Architecture](#database-architecture)
- [File Structure](#file-structure)
- [Setup and Installation](#setup-and-installation)
- [API Documentation](#api-documentation)
- [User Workflows](#user-workflows)
- [Configuration](#configuration)
- [Deployment](#deployment)

## 🚀 Project Overview

The **Eon Support Interface** is a comprehensive customer support ticketing system that provides a complete solution for managing customer inquiries, support tickets, and communication between customers and support agents. The application features separate dashboards for customers and agents, real-time messaging, file attachments, email integration, and automated notifications.

### Key Capabilities
- **Dual Interface**: Separate dashboards for customers and support agents
- **Real-time Communication**: Ticket-based messaging system with file attachments
- **Email Integration**: Gmail API integration for importing emails as tickets
- **Automated Notifications**: EmailJS integration for ticket confirmations
- **File Management**: Support for PDF, Excel, images, and CSV attachments
- **Advanced Filtering**: Comprehensive search and filter options
- **Responsive Design**: Modern, mobile-friendly interface

## ✨ Features

### 🔐 Authentication System
- **Customer Login**: Customer number and password-based authentication
- **Agent Login**: Email and password-based authentication
- **Session Management**: Context-based user state management

### 📊 Customer Dashboard
- **Ticket Creation**: Create new support tickets with attachments
- **Ticket Management**: View all personal tickets with status tracking
- **Real-time Messaging**: Communicate with support agents
- **File Attachments**: Upload and download files in conversations
- **Ticket Filtering**: Filter by status, priority, and date ranges

### 🛠️ Agent Dashboard
- **Comprehensive Ticket View**: See all customer tickets with advanced filtering
- **Ticket Management**: Update ticket status and priority
- **Customer Communication**: Respond to customer messages with attachments
- **Email Import**: Convert Gmail emails into support tickets
- **Advanced Analytics**: Ticket statistics and performance metrics
- **Bulk Operations**: Efficient ticket management tools

### 📧 Email Integration
- **Gmail API Integration**: Import customer emails as tickets
- **Automatic Email Notifications**: Send confirmations via EmailJS
- **Email-to-Ticket Conversion**: Extract customer data from emails
- **Template-based Emails**: Professional email templates

### 📁 File Management
- **Multi-format Support**: PDF, Excel, Images, CSV files
- **Secure Upload**: File validation and size limits (10MB)
- **Download Management**: Secure file access with direct URLs
- **Attachment Tracking**: View file history in ticket conversations

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0**: Modern React with hooks and context
- **React Router DOM 7.6.2**: Client-side routing
- **Lucide React 0.517.0**: Modern icon library
- **React Icons 5.5.0**: Additional icon sets
- **React Toastify 11.0.5**: Toast notifications
- **Vite 6.3.5**: Fast build tool and development server

### Backend
- **Node.js**: Runtime environment
- **Express.js 5.1.0**: Web application framework
- **PostgreSQL**: Primary database (hosted on Render)
- **Multer 2.0.1**: File upload middleware
- **CORS 2.8.5**: Cross-origin resource sharing
- **dotenv 17.0.1**: Environment variable management

### Database
- **PostgreSQL**: Relational database hosted on Render
- **Connection Pooling**: Efficient database connections
- **SSL Support**: Secure database connections

## 🔌 Third-Party Integrations

### 1. EmailJS Integration
**Purpose**: Automated email notifications for ticket confirmations

**Setup Requirements**:
1. Create an EmailJS account at [emailjs.com](https://emailjs.com)
2. Set up email service (Gmail, Outlook, etc.)
3. Create email templates for ticket confirmations
4. Configure environment variables:

```javascript
// src/config/emailConfig.js
export const EMAIL_CONFIG = {
  SERVICE_ID: 'service_de4s9eb',
  USER_ID: 'Ms9pGgjitQtO2cwpk',
  TEMPLATES: {
    TICKET_CONFIRMATION: 'template_e3wxnec',
    SUPPORT_NOTIFICATION: 'template_e3wxnec'
  },
  SUPPORT_EMAIL: 's78841441@gmail.com'
};
```

**Environment Variables**:
```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_USER_ID=your_user_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

### 2. Gmail API Integration
**Purpose**: Import customer emails as support tickets

**Setup Requirements**:
1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set up OAuth consent screen
4. Configure refresh token for server-side access

**Environment Variables**:
```env
VITE_GMAIL_CLIENT_ID=your_client_id
VITE_GMAIL_CLIENT_SECRET=your_client_secret
VITE_GMAIL_REFRESH_TOKEN=your_refresh_token
```

**API Permissions Required**:
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.modify`

### 3. PostgreSQL Database (Render)
**Purpose**: Primary data storage

**Connection Details**:
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

**Setup on Render**:
1. Create PostgreSQL database instance
2. Note connection credentials
3. Configure SSL settings
4. Set up connection pooling

## 🗄️ Database Architecture

### Tables Structure

#### 1. `ticket` Table
```sql
CREATE TABLE ticket (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    created_by VARCHAR(255),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_no VARCHAR(50),
    assigned_agent VARCHAR(255),
    assigned_agent_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields Description**:
- `ticket_id`: Unique identifier (EON-TKT-XXXXX format)
- `title`: Ticket subject/title
- `category`: technical, billing, general, feature, bug
- `priority`: low, medium, high, urgent
- `status`: open, in_progress, resolved, closed
- `customer_no`: Customer identification number
- `created_at/updated_at`: Timestamp tracking

#### 2. `message` Table
```sql
CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) REFERENCES ticket(ticket_id),
    content TEXT NOT NULL,
    sender_id VARCHAR(255),
    sender_type VARCHAR(20), -- 'customer' or 'agent'
    sender_name VARCHAR(255),
    message_type VARCHAR(20) DEFAULT 'public',
    attachments JSONB DEFAULT '[]',
    read_by JSONB DEFAULT '[]',
    reply_to INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields Description**:
- `attachments`: JSON array of file objects
- `read_by`: JSON array of user IDs who read the message
- `reply_to`: Reference to parent message for threading

#### 3. `customer` Table
```sql
CREATE TABLE customer (
    id SERIAL PRIMARY KEY,
    customer_no VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `users` Table (Agents)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Relationships
```
ticket (1) ←→ (many) message
customer (1) ←→ (many) ticket
users (1) ←→ (many) ticket (as assigned_agent)
```

## 📁 File Structure

```
SupportInterface/
├── 📄 package.json              # Dependencies and scripts
├── 📄 server.cjs               # Express.js backend server
├── 📄 vite.config.js           # Vite configuration
├── 📄 vercel.json              # Vercel deployment config
├── 📁 src/
│   ├── 📄 App.jsx              # Main application component
│   ├── 📄 main.jsx             # Application entry point
│   ├── 📁 components/          # Reusable components
│   │   ├── 📁 AgentLogin/      # Agent authentication
│   │   ├── 📁 CustomerLogin/   # Customer authentication
│   │   ├── 📁 Navbar/          # Navigation component
│   │   └── 📁 TicketDashboard/ # Ticket creation form
│   ├── 📁 contexts/            # React contexts
│   │   ├── 📄 PostgresAuthContext.jsx  # Authentication state
│   │   └── 📄 ThemeContext.jsx         # Theme management
│   ├── 📁 pages/               # Page components
│   │   ├── 📁 AgentDashboard/  # Agent interface
│   │   └── 📁 CustomerDashboard/ # Customer interface
│   ├── 📁 services/            # API and external services
│   │   ├── 📄 emailService.js       # EmailJS integration
│   │   ├── 📄 gmailService.js       # Gmail API integration
│   │   ├── 📄 postgresAgentApi.js   # Agent API calls
│   │   ├── 📄 postgresTicketApi.js  # Ticket API calls
│   │   └── 📄 fileUploadHelper.js   # File upload utilities
│   └── 📁 config/              # Configuration files
│       └── 📄 emailConfig.js   # Email service configuration
├── 📁 uploads/                 # File attachment storage
└── 📁 public/                  # Static assets
```

## ⚙️ Setup and Installation

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (local or cloud)
- **Gmail API** credentials (optional)
- **EmailJS** account (optional)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd SupportInterface
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@host:port/database
   PORT=3001
   
   # EmailJS (Optional)
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_USER_ID=your_user_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   
   # Gmail API (Optional)
   VITE_GMAIL_CLIENT_ID=your_client_id
   VITE_GMAIL_CLIENT_SECRET=your_client_secret
   VITE_GMAIL_REFRESH_TOKEN=your_refresh_token
   ```

4. **Database Setup**:
   - Create PostgreSQL database
   - Run table creation scripts
   - Insert initial data if needed

5. **Start the application**:
   
   **Backend (Database Server)**:
   ```bash
   node server.cjs
   ```
   
   **Frontend (Development Server)**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Customer Interface: `http://localhost:5173/`
   - Agent Interface: `http://localhost:5173/agent`

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://eondesk.onrender.com`

### Authentication Endpoints

#### Customer Login
```http
POST /customer-login
Content-Type: application/json

{
  "customer_no": "CUST123",
  "password": "password123"
}
```

#### Agent Login
```http
POST /login
Content-Type: application/json

{
  "email": "agent@example.com",
  "password": "password123"
}
```

### Ticket Management Endpoints

#### Create Ticket
```http
POST /tickets
Content-Type: application/json

{
  "title": "Issue with login",
  "category": "technical",
  "priority": "medium",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_no": "CUST123",
  "description": "Cannot log into my account"
}
```

#### Get All Tickets
```http
GET /tickets
```

#### Get Customer Tickets
```http
GET /tickets/customer/{customer_no}
```

#### Update Ticket Status
```http
PUT /tickets/{ticket_id}/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Message Endpoints

#### Get Ticket Messages
```http
GET /tickets/{ticket_id}/messages
```

#### Create Message
```http
POST /tickets/{ticket_id}/messages
Content-Type: application/json

{
  "content": "Thank you for contacting support",
  "sender_type": "agent",
  "sender_name": "Support Agent",
  "attachments": []
}
```

#### Upload Attachments
```http
POST /tickets/{ticket_id}/messages/upload
Content-Type: multipart/form-data

Files: attachments[] (up to 5 files, 10MB each)
```

### File Access
```http
GET /uploads/{filename}
```

## 🔄 User Workflows

### Customer Journey

1. **Login**: Enter customer number and password
2. **Dashboard**: View ticket overview and statistics
3. **Create Ticket**: Fill form with issue details
4. **Track Progress**: Monitor ticket status and responses
5. **Communicate**: Reply to agent messages with attachments
6. **Resolution**: Receive updates until ticket closure

### Agent Journey

1. **Login**: Enter email and password
2. **Dashboard**: View all tickets with filtering options
3. **Email Import**: Convert Gmail emails to tickets
4. **Ticket Management**: Update status, priority, and assignments
5. **Customer Communication**: Respond to customer inquiries
6. **Analytics**: Monitor performance metrics

### Navigation Structure

#### Customer Routes
```
/ → Customer Login
/customer → Customer Login
/customer-dashboard → Customer Dashboard
```

#### Agent Routes
```
/agent → Agent Login
/agent-dashboard → Agent Dashboard
```

### Ticket Status Flow
```
Open → In Progress → Resolved → Closed
  ↑         ↓           ↓
  ←---------←-----------← (Can reopen)
```

### Priority Levels
- **Low**: Non-urgent issues
- **Medium**: Standard priority (default)
- **High**: Important issues requiring quick attention
- **Urgent**: Critical issues requiring immediate attention

## ⚙️ Configuration

### Email Configuration
Located in `src/config/emailConfig.js`:

```javascript
export const EMAIL_CONFIG = {
  SERVICE_ID: 'your_emailjs_service_id',
  USER_ID: 'your_emailjs_user_id',
  TEMPLATES: {
    TICKET_CONFIRMATION: 'your_template_id',
    SUPPORT_NOTIFICATION: 'your_template_id'
  },
  SUPPORT_EMAIL: 'support@yourcompany.com'
};
```

### File Upload Configuration
```javascript
// Maximum file size: 10MB
// Allowed types: PDF, Excel, Images, CSV
const allowedTypes = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'text/csv'
];
```

### CORS Configuration
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://eon-desk.vercel.app',
    'https://eondesk.vercel.app'
  ],
  credentials: true
}));
```

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect GitHub repository to Render
2. Set environment variables
3. Configure build and start commands:
   ```bash
   Build Command: npm install
   Start Command: node server.cjs
   ```

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings:
   ```bash
   Build Command: npm run build
   Output Directory: dist
   ```
3. Set environment variables in Vercel dashboard

### Environment Variables for Production
```env
# Backend (Render)
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production

# Frontend (Vercel)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_USER_ID=your_user_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_GMAIL_CLIENT_ID=your_gmail_client_id
VITE_GMAIL_CLIENT_SECRET=your_gmail_client_secret
VITE_GMAIL_REFRESH_TOKEN=your_refresh_token
```

## 🎨 Features Showcase

### Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching capability
- **Modern Icons**: Lucide React and React Icons
- **Smooth Animations**: CSS transitions and hover effects
- **Toast Notifications**: User feedback for all actions

### Advanced Filtering
- **Search**: By ticket ID, title, customer name
- **Status Filter**: Open, In Progress, Resolved, Closed
- **Priority Filter**: Low, Medium, High, Urgent
- **Date Range**: Creation and last updated dates
- **Category Filter**: Technical, Billing, General, etc.

### File Management
- **Drag & Drop**: Easy file uploads
- **Preview**: Image and document previews
- **Security**: File type validation and size limits
- **Download**: Direct file access with secure URLs

---

## 📞 Support

For technical support or questions about this documentation, please contact the development team or create a ticket through the support interface.

**Last Updated**: January 2025
**Version**: 1.0.0
