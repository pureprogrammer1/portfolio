<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require_login();
verify_csrf();

$id = (int) ($_POST['id'] ?? 0);

if ($id > 0) {
    $stmt = db()->prepare('DELETE FROM projects WHERE id = :id');
    $stmt->execute([':id' => $id]);
}

header('Location: index.php');
exit;
