# BioGuard

> **Watch the Project Walkthrough:** [Explaination/Demo Video](https://drive.google.com/file/d/1IL02xIDRGFjU8m--8sLeyf30uiXnpY_7/view?usp=sharing)


BioGuard is a premium next-generation health vault designed to secure, analyze, and manage your medical history with precision. Built with Next.js 14 and powered by Google's Gemini AI, it transforms static medical documents into actionable health insights.

## 🌟 Key Features

### 🧠 Gemini-Powered Intelligence
-   **Deep Document Analysis**: Upload complex medical reports (PDF, images) and get instant, jargon-free summaries and risk assessments.
-   **Contextual Health Chat**: Ask questions about your history, medications, or reports in natural language.
-   **Smart Categorization**: Automatically organizes your uploads into meaningful categories.

### 🛡️ Secure Health Vault
-   **Zero-Knowledge Architecture**: Your data is yours. Secured with Firebase Authentication and Storage rules.
-   **MRFA (Medical Record Fast Access) Sharing**: Generate time-limited, encrypted ZIP bundles of your records to share securely with doctors. Links expire automatically after 24 hours.

### 🚑 Emergency & Utility
-   **Hospital Locator**: Interactive map integration to find nearest medical facilities instantly.
-   **Health News Feed**: Curated updates on medical breakthroughs and wellness tips.
-   **Appointment Management**: Track upcoming visits and medical timestamps.

### 🎨 Premium Experience
-   **Fluid Animations**: Powered by Framer Motion for a seamless, app-like feel.
-   **Glassmorphism UI**: Modern, clean aesthetic that reduces visual clutter.

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
=======
"A secure, AI-powered personal health vault built with Next.js 14, Firebase, and Gemini. Features a premium glassmorphism UI and intelligent document analysis."
>>>>>>> ad69da159ad2da73d4fd1fb92e14ed021bdf5930
