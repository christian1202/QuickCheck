# QuickCheck

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

> **A high-performance, dark-mode-first attendance tracking system built for speed.**

QuickCheck replaces slow paper roll calls with instant QR code scanning. Architected to handle high concurrency using Edge caching and NoSQL, ensuring sub-2-second check-in times for students.

---

## 📚 Engineering Documentation

This project follows industry-standard software engineering practices. The full planning and architecture specifications can be found below:

| Document | Description |
| :--- | :--- |
| **[📄 Product Requirements (PRD)](./docs/PRD.md)** | User personas, problem statement, and core feature scope (Phase 1). |
| **[🎨 Design System & UI](./docs/DESIGN.md)** | Visual tokens, dark mode palette, and user flow diagrams (Phase 2). |
| **[🏗️ Architecture & Schema](./docs/ARCHITECTURE.md)** | Tech stack justification, Firestore data modeling, and security strategy (Phase 3). |
| **[🗺️ Roadmap & Sprints](./docs/ROADMAP.md)** | Work Breakdown Structure (WBS) and Sprint planning (Phase 4). |

---

## 🚀 Features

* **Fast Auth:** Google OAuth integration via Firebase.
* **Real-time Dashboard:** Live updates of student attendance without page refreshes.
* **QR Generation:** Dynamic, secure QR codes for unique class sessions.
* **Dark Mode:** Native "Cyberpunk" aesthetic designed for low-light projector environments.
* **Export Ready:** Download attendance logs to CSV for administrative backup.

---

## 🛠️ Installation & Setup

Prerequisites: Node.js (v18+)

```bash
# 1. Clone the repository
git clone [https://github.com/yourusername/quick-check.git](https://github.com/yourusername/quick-check.git)

# 2. Enter the directory
cd quick-check

# 3. Install dependencies
npm install

# 4. Create environment variables
# (Ask the repo owner for the Firebase Config keys)
cp .env.example .env.local

# 5. Run the development server
npm run dev