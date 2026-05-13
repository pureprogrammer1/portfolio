# Portfolio Project Report

## Overview
This project is a personal portfolio 

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

## Submission Links
- GitHub Repository: `https://github.com/pureprogrammer1/portfolio`
- Live Demo: `https://bashar.infinityfree.me/`
