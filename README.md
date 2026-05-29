# Delta Stars Sovereign App 🌟

شريكك الأمثل للخضروات والفواكه والتمور عالية الجودة.

## 🚀 Deployment Guide

### GitHub & Netlify Integration

1.  **Push to GitHub**:
    *   Initialize a git repository: `git init`
    *   Add files: `git add .`
    *   Commit: `git commit -m "Initial commit"`
    *   Create a repository on GitHub and push: `git remote add origin <url> && git push -u origin main`

2.  **Deploy to Netlify**:
    *   Connect your GitHub repository to Netlify.
    *   Set the build command: `npm run build`
    *   Set the publish directory: `dist`
    *   Add the following environment variables in Netlify:
        *   `VITE_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY`
        *   `VITE_SUPABASE_EDGE_FUNCTIONS_URL` (optional)
        *   `GEMINI_API_KEY` (if using AI features)

### Backend System (Supabase)

The app is built on top of **Supabase**. Ensure your Supabase project has the following tables:
*   `products`
*   `categories`
*   `units`
*   `branches`
*   `ads`
*   `legal_pages`
*   `orders`
*   `invoices`
*   `notifications`
*   `delivery_agents`
*   `users` (for profile data)

## 🛠 Tech Stack
*   **Frontend**: React + Vite + Tailwind CSS
*   **Backend**: Supabase (PostgreSQL + Realtime)
*   **AI**: Google Gemini API
*   **Mobile**: Capacitor (PWA to Native)

## 📦 Installation
```bash
npm install
npm run dev
```
