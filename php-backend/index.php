<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
header('Content-Type: application/json');
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/php-backend', '', $uri); // Adjust if deployed in subfolder

// Helper: parse JSON body
function getJsonBody() {
    return json_decode(file_get_contents('php://input'), true);
}

// Routing
if ($uri === '/tickets' && $method === 'GET') {
    // Get all tickets
    $stmt = $pdo->query('SELECT * FROM ticket ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll());
    exit;
}
if ($uri === '/tickets' && $method === 'POST') {
    // Create a new ticket
    $data = getJsonBody();
    $ticket_id = $data['ticket_id'] ?? ('TKT-' . strtoupper(uniqid()));
    $stmt = $pdo->prepare('INSERT INTO ticket (ticket_id, title, category, priority, status, created_by, customer_name, customer_email, customer_no, assigned_agent, assigned_agent_name, description, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW()) RETURNING *');
    $stmt->execute([
        $ticket_id,
        $data['title'] ?? 'Support Request',
        $data['category'] ?? 'general',
        $data['priority'] ?? 'medium',
        $data['status'] ?? 'open',
        $data['created_by'] ?? null,
        $data['customer_name'] ?? null,
        $data['customer_email'] ?? null,
        $data['customer_no'] ?? null,
        $data['assigned_agent'] ?? null,
        $data['assigned_agent_name'] ?? null,
        $data['description'] ?? null
    ]);
    echo json_encode($stmt->fetch());
    exit;
}
if (preg_match('#^/tickets/([^/]+)/messages$#', $uri, $m) && $method === 'GET') {
    // Get all messages for a ticket
    $stmt = $pdo->prepare('SELECT * FROM message WHERE ticket_id = ? ORDER BY timestamp ASC');
    $stmt->execute([$m[1]]);
    echo json_encode($stmt->fetchAll());
    exit;
}
if (preg_match('#^/tickets/([^/]+)/status$#', $uri, $m) && $method === 'PUT') {
    // Update ticket status
    $data = getJsonBody();
    $stmt = $pdo->prepare('UPDATE ticket SET status = ?, updated_at = NOW() WHERE ticket_id = ? RETURNING *');
    $stmt->execute([$data['status'], $m[1]]);
    $row = $stmt->fetch();
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Ticket not found']);
    } else {
        echo json_encode($row);
    }
    exit;
}
if (preg_match('#^/tickets/([^/]+)/messages$#', $uri, $m) && $method === 'POST') {
    // Create a new message for a ticket
    $data = getJsonBody();
    $stmt = $pdo->prepare('INSERT INTO message (ticket_id, content, sender_id, sender_type, sender_name, message_type, attachments, read_by, reply_to, timestamp) VALUES (?,?,?,?,?,?,?,?,?,NOW()) RETURNING *');
    $stmt->execute([
        $m[1],
        $data['content'],
        $data['sender_id'],
        $data['sender_type'],
        $data['sender_name'],
        $data['message_type'] ?? 'public',
        json_encode($data['attachments'] ?? []),
        json_encode($data['read_by'] ?? []),
        $data['reply_to'] ?? null
    ]);
    echo json_encode($stmt->fetch());
    exit;
}
if (preg_match('#^/tickets/([^/]+)/messages/upload$#', $uri, $m) && $method === 'POST') {
    // File upload (max 5 files)
    $uploads = [];
    if (!isset($_FILES['attachments'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No files uploaded']);
        exit;
    }
    $files = $_FILES['attachments'];
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir);
    for ($i = 0; $i < min(count($files['name']), 5); $i++) {
        $name = $files['name'][$i];
        $tmp = $files['tmp_name'][$i];
        $unique = time() . '-' . rand(100000,999999) . '-' . $name;
        $dest = $uploadDir . $unique;
        if (move_uploaded_file($tmp, $dest)) {
            $uploads[] = [
                'originalname' => $name,
                'filename' => $unique,
                'path' => '/uploads/' . $unique,
                'mimetype' => $files['type'][$i],
                'size' => $files['size'][$i]
            ];
        }
    }
    echo json_encode(['attachments' => $uploads]);
    exit;
}
if ($uri === '/register' && $method === 'POST') {
    $data = getJsonBody();
    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }
    try {
        $stmt = $pdo->prepare('INSERT INTO users (email, password) VALUES (?, ?) RETURNING id, email');
        $stmt->execute([$data['email'], $data['password']]);
        echo json_encode(['user' => $stmt->fetch()]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23505') {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    exit;
}
if ($uri === '/login' && $method === 'POST') {
    $data = getJsonBody();
    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT id, email FROM users WHERE email = ? AND password = ?');
    $stmt->execute([$data['email'], $data['password']]);
    $user = $stmt->fetch();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    } else {
        echo json_encode(['user' => $user]);
    }
    exit;
}
if ($uri === '/customer-login' && $method === 'POST') {
    $data = getJsonBody();
    if (empty($data['customer_no']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Customer No. and password are required']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT id, customer_no FROM customer WHERE customer_no = ? AND password = ?');
    $stmt->execute([$data['customer_no'], $data['password']]);
    $customer = $stmt->fetch();
    if (!$customer) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    } else {
        echo json_encode(['customer' => $customer]);
    }
    exit;
}
if (preg_match('#^/tickets/customer/([^/]+)$#', $uri, $m) && $method === 'GET') {
    $stmt = $pdo->prepare('SELECT * FROM ticket WHERE customer_no = ? ORDER BY created_at DESC');
    $stmt->execute([$m[1]]);
    echo json_encode($stmt->fetchAll());
    exit;
}
// Serve uploaded files
if (preg_match('#^/uploads/(.+)$#', $uri, $m) && $method === 'GET') {
    $file = __DIR__ . '/uploads/' . basename($m[1]);
    if (file_exists($file)) {
        $mime = mime_content_type($file);
        header('Content-Type: ' . $mime);
        readfile($file);
        exit;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
        exit;
    }
}
// 404 fallback
http_response_code(404);
echo json_encode(['error' => 'Not found']);
