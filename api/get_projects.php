<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

try {
    $stmt = db()->query(
        'SELECT id, tag, title, description, tech_stack, github_url, live_url
         FROM projects
         ORDER BY sort_order ASC, created_at DESC'
    );

    json_response($stmt->fetchAll());
} catch (Throwable $error) {
    json_response(['error' => 'Could not load projects.'], 500);
}
