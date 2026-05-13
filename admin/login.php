<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';

if (is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $username = clean_input($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD_HASH)) {
        session_regenerate_id(true);
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        setcookie('portfolio_admin_last_login', date('Y-m-d H:i:s'), time() + 60 * 60 * 24 * 30, '/', '', false, true);
        header('Location: index.php');
        exit;
    }

    $error = 'Invalid username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Login</title>
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="stylesheet" href="admin.css" />
</head>
<body class="admin-page">
  <main class="admin-shell admin-login">
    <h1>Admin Login</h1>
    <?php if ($error): ?>
      <p class="admin-alert"><?php echo h($error); ?></p>
    <?php endif; ?>
    <form method="post" class="admin-form">
      <input type="hidden" name="csrf_token" value="<?php echo h(csrf_token()); ?>" />
      <label>
        Username
        <input type="text" name="username" autocomplete="username" required />
      </label>
      <label>
        Password
        <input type="password" name="password" autocomplete="current-password" required />
      </label>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </main>
</body>
</html>
