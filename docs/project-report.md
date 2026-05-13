# Portfolio Project Report

## Overview
This project is a personal portfolio for Bashar Abdulaziz. It presents profile information, skills, projects, experience, contact details, a downloadable CV, and a 3D intro animation.

## Technologies Used
- HTML, CSS, JavaScript
- Three.js for the intro animation
- PHP and MySQL for server-side logic and persistence
- Fetch API for AJAX project loading and contact form submission
- PHP sessions and cookies for the admin dashboard

## Database Features
- `projects` table stores dynamic portfolio projects.
- `contacts` table stores messages from the Contact Me form.
- SQL export is included in `database/portfolio_db.sql`.

## Admin Dashboard
The admin dashboard is located in `admin/login.php`. After login, the admin can add, edit, and delete projects. The dashboard also displays recent contact messages. Login uses PHP sessions, password hashing, CSRF tokens, and a last-login cookie.


## AJAX Integration
The Projects section loads data asynchronously from `api/get_projects.php`. The contact form sends data asynchronously to `api/save_contact.php` without refreshing the page.

## Setup Steps
1. Import `database/portfolio_db.sql` into MySQL.
2. Update database settings in `api/config.php` if needed.
3. Run the project through a PHP server such as XAMPP/Apache.
4. Visit `index.html` for the portfolio.
5. Visit `admin/login.php` for admin project management.

## Submission Links
- GitHub Repository: `https://github.com/pureprogrammer1/portfolio`
- Live Demo: add the hosted PHP/MySQL portfolio URL here after deployment.
