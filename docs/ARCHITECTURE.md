# 3.0 Technical Architecture & Data
**Status:** Approved
**Stack:** React + Firebase

## 3.1 Tech Stack Strategy
* **Frontend:** React (Vite) + Tailwind CSS
    * *Why:* Fast load times, component reusability, and dark mode support.
* **Backend:** Firebase (BaaS)
    * *Why:* Handles auth, database, and hosting without managing a server.
* **State Management:** React Context
    * *Why:* Lightweight solution for managing "User Session" without external bloat.
* **Analytics:** Recharts
    * *Why:* Optimized for React, lightweight SVG rendering for attendance graphs.

## 3.2 Data Modeling (Firestore Schema)
Since we are using NoSQL, we define Collections rather than Tables.

### Collection: `users`
*Stores profile data for Admins and Students.*
| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | string (PK) | Unique Auth ID from Firebase |
| `email` | string | User email address |
| `role` | string | 'admin' or 'student' |
| `profile_url` | string | URL to avatar image |
| `class_id` | reference | (Optional) Link to their primary section |

### Collection: `sessions`
*Represents a single class meeting (e.g., "Monday Math").*
| Field | Type | Description |
| :--- | :--- | :--- |
| `session_id` | string (PK) | Auto-generated ID |
| `date` | timestamp | When the class started |
| `created_by` | string (UID) | The Admin who started it |
| `is_active` | boolean | If true, students can still scan |
| `code` | string | The secret string inside the QR code |

### Collection: `attendance_logs`
*The actual record of a student scanning in.*
| Field | Type | Description |
| :--- | :--- | :--- |
| `log_id` | string (PK) | Auto-generated ID |
| `session_id` | reference | Link to the specific class session |
| `student_id` | reference | Link to the user who scanned |
| `timestamp` | timestamp | Exact time of scan |
| `status` | string | 'present' or 'late' |
| `location` | geopoint | (Optional) Lat/Long for verification |