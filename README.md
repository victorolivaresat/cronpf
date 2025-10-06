# Project Cron PF

## 🛠️ Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS & Shadcn UI
-   **Database & Auth**: Firebase Realtime Database & Firebase Authentication
-   **State Management**: React Context & Hooks
-   **Deployment**: Vercel / Firebase Hosting

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or newer)
-   A Firebase project

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/victorolivaresat/cronpf.git
    cd cronpf
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    -   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    -   Enable **Authentication** with the "Email/Password" sign-in method.
    -   Create a **Realtime Database**. Start in test mode for easy setup, but remember to configure security rules for production.
    -   In your project settings, find your web app's Firebase configuration object.

4.  **Configure Environment Variables:**
    -   Create a file named `.env.local` in the root of your project.
    -   Add your Firebase configuration details to this file:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
