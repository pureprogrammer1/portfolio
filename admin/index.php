<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
require_login();

$editing = null;
$projectId = isset($_GET['edit']) ? (int) $_GET['edit'] : 0;

if ($projectId > 0) {
    $stmt = db()->prepare('SELECT * FROM projects WHERE id = :id');
    $stmt->execute([':id' => $projectId]);
    $editing = $stmt->fetch() ?: null;
}

$projects = db()->query('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC')->fetchAll();
$contacts = db()->query('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 20')->fetchAll();
$lastLogin = $_COOKIE['portfolio_admin_last_login'] ?? 'First login this month';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Admin</title>
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="stylesheet" href="admin.css" />
</head>
<body class="admin-page">
  <main class="admin-shell">
    <header class="admin-header">
      <div>
        <p class="section-label">Admin Dashboard</p>
        <h1>Manage Portfolio Content</h1>
        <p class="admin-muted">Last login cookie: <?php echo h($lastLogin); ?></p>
      </div>
      <a class="btn btn-outline" href="logout.php">Logout</a>
    </header>

    <section class="admin-panel">
      <h2><?php echo $editing ? 'Edit Project' : 'Add Project'; ?></h2>
      <form method="post" action="save_project.php" class="admin-form admin-grid-form">
        <input type="hidden" name="csrf_token" value="<?php echo h(csrf_token()); ?>" />
        <input type="hidden" name="id" value="<?php echo h($editing['id'] ?? ''); ?>" />
        <label>
          Tag
          <input name="tag" value="<?php echo h($editing['tag'] ?? ''); ?>" required />
        </label>
        <label>
          Title
          <input name="title" value="<?php echo h($editing['title'] ?? ''); ?>" required />
        </label>
        <label class="admin-full">
          Description
          <textarea name="description" rows="3" required><?php echo h($editing['description'] ?? ''); ?></textarea>
        </label>
        <label>
          Tech Stack
          <input name="tech_stack" value="<?php echo h($editing['tech_stack'] ?? ''); ?>" placeholder="HTML · CSS · JavaScript" required />
        </label>
        <label>
          Sort Order
          <input type="number" name="sort_order" value="<?php echo h($editing['sort_order'] ?? '0'); ?>" />
        </label>
        <label>
          GitHub URL
          <input type="url" name="github_url" value="<?php echo h($editing['github_url'] ?? ''); ?>" />
        </label>
        <label>
          Live URL
          <input type="url" name="live_url" value="<?php echo h($editing['live_url'] ?? ''); ?>" />
        </label>
        <button type="submit" class="btn btn-primary"><?php echo $editing ? 'Update Project' : 'Add Project'; ?></button>
        <?php if ($editing): ?>
          <a href="index.php" class="btn btn-outline">Cancel Edit</a>
        <?php endif; ?>
      </form>
    </section>

    <section class="admin-panel">
      <h2>Projects From Database</h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Tag</th>
              <th>Stack</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($projects as $project): ?>
              <tr>
                <td><?php echo h($project['title']); ?></td>
                <td><?php echo h($project['tag']); ?></td>
                <td><?php echo h($project['tech_stack']); ?></td>
                <td class="admin-actions">
                  <a href="index.php?edit=<?php echo (int) $project['id']; ?>">Edit</a>
                  <form method="post" action="delete_project.php">
                    <input type="hidden" name="csrf_token" value="<?php echo h(csrf_token()); ?>" />
                    <input type="hidden" name="id" value="<?php echo (int) $project['id']; ?>" />
                    <button type="submit">Delete</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>

    <section class="admin-panel">
      <h2>Recent Contact Messages</h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($contacts as $contact): ?>
              <tr>
                <td><?php echo h($contact['name']); ?></td>
                <td><a href="mailto:<?php echo h($contact['email']); ?>"><?php echo h($contact['email']); ?></a></td>
                <td><?php echo h($contact['message']); ?></td>
                <td><?php echo h($contact['created_at']); ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>
