<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Invalid request method.'], 405);
}

$name = clean_input($_POST['name'] ?? '');
$email = clean_input($_POST['email'] ?? '');
$message = clean_input($_POST['message'] ?? '');

if (mb_strlen($name) < 2) {
    json_response(['success' => false, 'error' => 'Please enter your full name.'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'error' => 'Please enter a valid email address.'], 422);
}

if (mb_strlen($message) < 10) {
    json_response(['success' => false, 'error' => 'Message must be at least 10 characters.'], 422);
}

try {
    $stmt = db()->prepare(
        'INSERT INTO contacts (name, email, message, ip_address, user_agent)
         VALUES (:name, :email, :message, :ip_address, :user_agent)'
    );

    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':message' => $message,
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        ':user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
    ]);

    json_response(['success' => true]);
} catch (Throwable $error) {
    json_response(['success' => false, 'error' => 'Could not save your message.'], 500);
}
