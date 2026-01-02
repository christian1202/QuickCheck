# Technical Design Document: Secretary-Managed Attendance System

## 1. Project Overview
This document outlines the architecture for a high-security, high-performance attendance system designed for centralized management by secretaries. The system prioritizes data integrity, security, and scalability to handle large user bases (up to 1 million users) efficiently.

---

## 2. Architecture & Core Features

### A. Secretary-Centric Workflow
**Philosophy:** We shifted from a "Student Self-Service" model to a "Secretary Centralized" model to ensure data reliability and prevent fraudulent attendance.

### B. Smart Search Bar (Sticky Header)
* **Description:** A persistent search input pinned to the top of the data table.
* **Why Use This?** Scrolling through 1,000+ rows is operationally impossible. A secretary needs to find a specific member in under 2 seconds to prevent queues.
* **Technical Explanation:** This reduces "Time-to-Interaction" (TTI). For datasets < 2,000 users, client-side filtering provides instant results. For larger datasets, this interfaces with Firestore indexes.

### C. Optimistic UI Updates
* **Description:** The "Present" button turns green instantly (0ms) upon interaction, while the database saves silently in the background (~500ms latency).
* **Why Use This?** Eliminates interface lag. If a secretary marks 50 people, waiting 0.5s per click results in 25 seconds of dead time. Optimistic UI reduces this to 0 seconds.
* **Technical Explanation:** Decouples the **UI State** from the **Server State**. The app assumes success and only reverts if the background promise fails.

### D. "Triple Threat" Export Engine
* **Description:** A single export utility supporting CSV, PDF, and DOCX formats.
* **Why Use This?** Different stakeholders require different data formats:
    * **CSV:** For Data Analysts/Accountants (Excel processing).
    * **PDF:** For Executives (Immutable, read-only summaries).
    * **DOCX:** For Secretaries (Editable reports for qualitative notes).
* **Technical Explanation:** Utilizes client-side generation libraries (`jspdf`, `file-saver`, `docx`) to generate reports within the browser, reducing server load and costs.

### E. Offline Persistence (PWA Support)
* **Description:** The system remains functional during internet outages, queuing data locally and syncing automatically when connectivity returns.
* **Why Use This?** Internet stability is unpredictable. Mission-critical systems must function without active WiFi.
* **Technical Explanation:** Leverages **Firestore Offline Persistence** (IndexedDB). Write operations are stored in the browser's local database and flushed to the cloud socket upon reconnection.

---

## 3. Security Architecture (The "Zero-Trust" Model)

**Goal:** We assume the frontend client can be compromised and rely on strict backend enforcement.

### Layer 1: Firestore Security Rules (The Firewall)
* **Description:** Backend logic that validates every read/write request before processing.
* **Why Use This?** Frontend security (hiding buttons) is easily bypassed. Security Rules ensure that direct API calls from unauthorized sources are rejected.
* **Technical Explanation:**
    ```javascript
    match /attendance_logs/{logId} {
      // Only allow write if the user has the 'admin' custom claim
      allow read, write: if request.auth.token.role == 'admin';
    }
    ```

### Layer 2: Role-Based Access Control (RBAC)
* **Description:** Assigning strict `role: 'admin'` or `role: 'secretary'` claims to user accounts via Firebase Auth.
* **Why Use This?** Prevents unauthorized users (e.g., students) from accessing sensitive data even if they bypass the login screen.
* **Technical Explanation:** Permissions are hard-coded into the User's Authentication Token, cryptographically signed by Google, making them tamper-proof.

### Layer 3: Disable Public Sign-Up
* **Description:** Removal of public registration endpoints. Accounts are only created via backend administration scripts.
* **Why Use This?** Drastically reduces the attack surface by preventing hackers or bots from creating spam accounts.

### Layer 4: Firebase App Check
* **Description:** Integration with reCAPTCHA Enterprise to validate traffic origin.
* **Why Use This?** Prevents automated scripts, bots, and DDoS attacks from hammering the database.
* **Technical Explanation:** Requests must carry a valid attestation token proving they originated from the legitimate web application.

---

## 4. Optimization & Scalability Strategy

**Goal:** Support 1 Million+ User Records without performance degradation.

### A. Cursor-Based Pagination ("Infinite Scroll")
* **Description:** Data is fetched in chunks (e.g., 50 records) rather than downloading the entire dataset.
* **Why Use This?** Rendering 10,000+ HTML elements crashes the browser DOM and consumes excessive bandwidth.
* **Technical Explanation:** Uses Firestore `startAfter()` cursors. This ensures O(1) memory usage on the client regardless of total database size.

### B. Composite Indexes
* **Description:** Pre-sorted database views (e.g., `Logs sorted by Date + Event`).
* **Why Use This?** searching unindexed data is O(n) (slow). Indexes allow O(log n) lookups.
* **Technical Explanation:** Enables complex queries (filtering by Status AND Date AND Name) to execute in milliseconds.

### C. Input Debouncing
* **Description:** Search inputs wait for a pause in typing (e.g., 300ms) before triggering a query.
* **Why Use This?** Prevents flooding the database with intermediate queries (e.g., "J", "Ju", "Jua").
* **Technical Explanation:** Reduces database read costs by approximately 75% and prevents UI flickering.