# MindCare - Mental Health Application

MindCare is a comprehensive mental health web application designed to connect users with qualified therapists and provide self-assessment tools. It offers a secure, intuitive platform for managing mental well-being.

## Features

- **User Authentication:** Secure email/password and Google Sign-in authentication using Firebase Auth.
- **Email Verification Flow:** Ensures real users are joining the platform with dedicated UI for email verification tracking.
- **Personalized Onboarding:** Collects user preferences and needs when first logging in.
- **Mental Health Assessments:** Interactive quizzes and assessments to understand your mental state.
- **Therapist Finder:** Browse and connect with mental health professionals based on your needs.
- **User Dashboard/Profile:** Manage personal information, viewing history, and settings.
- **Mobile Responsive Design:** The entire application is optimized for mobile, tablet, and desktop viewing.

## Prerequisites

Before running this project locally, make sure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v16.x or later)
- Git

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd mindcare-mental-health-app
git checkout alpha
```

### 2. Install Dependencies

The project uses `npm` for package management. Install the required Node modules:

```bash
npm install
```

### 3. Firebase Configuration

You will need to connect the application to your own Firebase project.
Create a `.env` file in the root directory and add your Firebase configuration credentials:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```
*(Note: Keep your `.env` file secure and never push it to public version control! It is already added to `.gitignore`)*

### 4. Run the Development Server

Start up the local Vite development server:

```bash
npm run dev
```

Your app should now be running locally at `http://localhost:5173/` or `http://localhost:5174/` (check the terminal output).

## Tech Stack
- **Frontend Framework:** Vanilla JavaScript + HTML/CSS
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Backend/Database/Auth:** [Firebase](https://firebase.google.com/) (Auth, Firestore DB, Hosting)
- **Icons:** [Remix Icon](https://remixicon.com/)
- **Fonts:** Google Fonts (Inter)

## Note on Browser Extensions (e.g. Brave)
Very strict privacy browsers (like Brave) or extensions may block third-party cookies by default, which can interfere with the Firebase Google Login popup (`signInWithPopup`). The application contains a fallback to securely redirect the page if the popup fails (`signInWithRedirect`), ensuring full compatibility.

## Deployment
To deploy this project:
1. Ensure Firebase CLI is installed (`npm install -g firebase-tools`)
2. Login to Firebase (`firebase login`)
3. Build the production files (`npm run build`)
4. Deploy to Firebase Hosting (`firebase deploy`)