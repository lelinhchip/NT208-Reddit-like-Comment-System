<div align="center">

<img width="50%" alt="Twinest Banner" src="" style="border-radius: 12px; margin-bottom: 20px;" />

<p>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
</p>

<em>A modern, full-stack discussion platform featuring nested comments, real-time interactions, and containerized deployment</em>

<br />

<p>
  <b><a href="#-key-features">Key Features</a></b> • 
  <b><a href="#-tech-stack">Tech Stack</a></b> • 
  <b><a href="#-installation--usage">Installation</a></b> • 
  <b><a href="#-team-members">Team</a></b>
</p>

</div>

## Project Overview

This project is a Reddit-like comment and discussion system developed to handle hierarchical data structures, user authentication, and interactive UI components. Built with a robust React frontend and a Node.js/MySQL backend, the application is fully containerized using Docker for seamless deployment and scalability. Developed by students at the University of Information Technology (UIT).

## Academic Context

- **Course:** NT208
- **Objective:** Apply practical full-stack development, database management (relational mapping for nested items), and DevOps practices (Docker).
- **Scope:** Educational project demonstrating modern web architecture.

## Key Features

<div align="center">
  <table>
    <tr>
      <td width="25%" align="center">
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Memo.png" width="40px" height="40px"/>
        <br/>
        <b>Post Management</b>
        <br/>
        <sub>Create, read, update, and delete posts with a rich user interface.</sub>
      </td>
      <td width="25%" align="center">
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Speech%20Balloon.png" width="40px" height="40px"/>
        <br/>
        <b>Nested Comments</b>
        <br/>
        <sub>Recursive multi-level comment threads to keep discussions organized.</sub>
      </td>
      <td width="25%" align="center">
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Up!%20Button.png" width="40px" height="40px"/>
        <br/>
        <b>Voting System</b>
        <br/>
        <sub>Interactive Upvote/Downvote functionality for both posts and comments.</sub>
      </td>
      <td width="25%" align="center">
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Locked.png" width="40px" height="40px"/>
        <br/>
        <b>Secure Auth</b>
        <br/>
        <sub>Complete user registration, login, and profile management system.</sub>
      </td>
    </tr>
  </table>
</div>

## Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend & Database
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

### DevOps & Tools
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

</div>

## Team Members
<div align="center">

| Name | Role | MSSV |
| :--- | :--- |:--- |
| **Lê Hồ Khánh Linh** | Developer | 24520958 | 
| **Bùi Nguyễn Minh Anh** | Developer | 24520086 | 
| **Lê Lâm Bảo Tư** | Developer | 24521909 |
| **Thân Thị Khánh Linh** | Developer | 24520969 | 

</div>

## Installation & Usage

### Method 1: Using Docker (Recommended)
The fastest way to get the project running with zero configuration.

```bash
# 1. Clone the repository
git clone [https://github.com/lelinhchip/NT208-Reddit-like-Comment-System.git](https://github.com/lelinhchip/NT208-Reddit-like-Comment-System.git)
cd NT208-Reddit-like-Comment-System

# 2. Build and start all services
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
# Database: localhost:3307
```

> **Note:** To stop the application and clean up volumes, use `docker-compose down -v`.

---

### Method 2: Manual Local Setup

**1. Database Setup:**
```bash
mysql -u root -p < database/01-init.sql
```

**2. Backend Setup:**
```bash
cd backend
npm install
cp .env.example .env  # Update with your MySQL credentials
npm start
```

**3. Frontend Setup:**
```bash
cd frontend
npm install
cp .env.example .env  # Point VITE_API_URL to backend
npm run dev
```

## API Documentation

Detailed endpoint specifications and payload structures can be found in the [API_DOCUMENTATION.md](API_DOCUMENTATION.md) file.

## Future Enhancements
- Implementation of WebSocket for real-time comment updates.
- Advanced search and filtering by tags/categories.
- Image upload support via Cloudinary or AWS S3.
- Email verification and password reset workflows.
<div align="center">
  <br>
</div>

---

<div align="center">
  <p style="font-size: 10px; color: gray">© 2026 Twinest Project</p>
</div>