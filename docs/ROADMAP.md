# 4.0 Work Breakdown Structure (WBS)
**Methodology:** Agile Sprints (1-week cycles)

## 🏁 Sprint 1: The Foundation
*Goal: Get the app running with Authentication.*
- [ ] **Setup:** Initialize Git repo and React (Vite) project.
- [ ] **Config:** Connect Firebase Auth and Firestore SDKs.
- [ ] **UI:** Build the "Shell" (Navbar, Sidebar, Layout) with Dark Mode.
- [ ] **Feature:** Implement "Sign in with Google".
- [ ] **Security:** Set basic Firestore Rules (only auth users can read).

## 🚀 Sprint 2: The Core Logic
*Goal: Allow an Admin to create a QR code and a Student to scan it.*
- [ ] **Admin:** Create "Dashboard" page (View active sessions).
- [ ] **Admin:** Build "Session Generator" (Input class name -> Generate QR).
- [ ] **Student:** Build "Scanner View" (Access camera permissions).
- [ ] **Logic:** Validate Scanned Code -> Write to `attendance_logs`.
- [ ] **UI:** Success/Error animations for the student.

## 📊 Sprint 3: Data & Polish
*Goal: Visualize the data and make it professional.*
- [ ] **Data:** Connect Recharts to show "Attendance this Week".
- [ ] **Export:** Create "Download CSV" function for Admins.
- [ ] **Polish:** Add loading skeletons (skeletons while data loads).
- [ ] **Polish:** Add "Toast" notifications (Popups for success/errors).