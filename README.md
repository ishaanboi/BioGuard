# BioGuard

BioGuard is a premium, secure personal health vault built with Next.js 14, Firebase, and Framer Motion. Powered by Gemini AI for intelligent document analysis.

## 🚀 Getting Started

### 1. Project Directory
The project is located in `d:\hackathon proj\main proj`.

### 2. Environment Setup
You **MUST** configure Firebase for the app to work.
1.  Create a project at [console.firebase.google.com](https://console.firebase.google.com/).
2.  Enable **Authentication** (Email/Password).
3.  Enable **Storage**.
4.  Copy your firebase config keys.
5.  Open `.env.local` in this folder and paste your keys:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    ```

### 3. Install & Run
```bash
cd "d:\hackathon proj\main proj"
npm install
npm run dev
```

## 🛠 Tech Stack
-   **Frontend**: Next.js 14 (App Router)
-   **Styling**: CSS Modules + Framer Motion (Glassmorphism)
-   **Auth & Storage**: Firebase
-   **Icons**: Lucide React

## 🔒 Security
Storage rules are configured in `storage.rules`. Use the Firebase CLI to deploy them:
```bash
firebase init storage
firebase deploy --only storage
```
