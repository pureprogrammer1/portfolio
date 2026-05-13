<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require_login();
verify_csrf();

$id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
$data = [
    ':tag' => clean_input($_POST['tag'] ?? ''),
    ':title' => clean_input($_POST['title'] ?? ''),
    ':description' => clean_input($_POST['description'] ?? ''),
    ':tech_stack' => clean_input($_POST['tech_stack'] ?? ''),
    ':github_url' => clean_input($_POST['github_url'] ?? ''),
    ':live_url' => clean_input($_POST['live_url'] ?? ''),
    ':sort_order' => (int) ($_POST['sort_order'] ?? 0),
];

if ($data[':tag'] === '' || $data[':title'] === '' || $data[':description'] === '' || $data[':tech_stack'] === '') {
    exit('Required fields are missing.');
}

if ($id > 0) {
    $data[':id'] = $id;
    $stmt = db()->prepare(
        'UPDATE projects
         SET tag = :tag, title = :title, description = :description, tech_stack = :tech_stack,
             github_url = :github_url, live_url = :live_url, sort_order = :sort_order
         WHERE id = :id'
    );
} else {
    $stmt = db()->prepare(
        'INSERT INTO projects (tag, title, description, tech_stack, github_url, live_url, sort_order)
         VALUES (:tag, :title, :description, :tech_stack, :github_url, :live_url, :sort_order)'
    );
}

$stmt->execute($data);

header('Location: index.php');
exit;
