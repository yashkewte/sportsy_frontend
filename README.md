
## Getting Started
🏅 Sportsy
“Find Players. Join Games. Play More.”

Sportsy is a modern web platform that helps users find, join, and organize local sports events. Built using Next.js and Firebase, it offers a fast, responsive, and secure experience for both casual players and sports organizers.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

🚀 Tech Stack
Frontend: Next.js 14 (App Router), Tailwind CSS, Lucide Icons

Backend: Firebase (Authentication, Firestore, Storage)

State Management:Context API

UI/UX: Responsive Design, Dark Mode, Toast Notifications (Sonner)

🔐 Core Features
Feature	Description
✅ User Authentication	Login, Register, Forgot Password, Email Verification
🔒 Protected Routes	Only logged-in users can access dashboards
🧑‍💼 Admin Routes	Role-based access (admin/user)
📅 Event Management (CRUD)	Create, edit, delete, join events
🔍 Event Filtering	Filter by city, sport, date
📄 User Dashboard	View profile and joined events
🛠️ Admin Panel	Manage users and assign roles
🔔 Toast Notifications	For feedback on user actions

🧭 Folder Structure (App Router)

/app
  ├─ (auth)/login
  ├─ (auth)/register
  ├─ (auth)/forgot-password
  ├─ (user)/dashboard
  ├─ (admin)/admin/dashboard
  ├─ about/
  ├─ contact/
  ├─ events/
  └─ layout.js

/context
/components
/store
/firebase



🧪 Setup Instructions

# 1. Clone the repo
git clone https://github.com/yashkewte/sportsy_frontend.git
cd sportsy

# 2. Install dependencies
npm install

# 3. Setup Firebase
# - Create a project on Firebase Console
# - Enable Authentication (Email/Password)
# - Setup Firestore DB
# - Add your credentials in /firebase/firebaseConfig.js

# 4. Run the app
npm run dev