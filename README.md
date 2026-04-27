# Code Optimization & Analysis Platform

## Overview
A React-based web application that provides AI-driven code optimization and analysis. Users register/login, then paste code snippets in various programming languages to receive suggestions from a real backend API.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Animations**: Framer Motion, AOS
- **Icons**: Lucide React, React Icons
- **Package Manager**: npm

## API Integration
- **Base URL**: `https://code-efficiency.purelife-clinic.com`
- **Auth**: Laravel Sanctum token-based — token stored in `localStorage` as `"token"`, sent as `Authorization: Bearer {token}`
- **API client**: `client/src/lib/api.ts` (axios with Bearer interceptors)

## Project Structure
```
client/
  src/
    components/    # Reusable UI components (ChatSidebar, etc.)
    context/       # AuthContext (real API login/register/logout)
    hooks/         # useChatManager (real API conversations)
    lib/
      api.ts       # Central API client
      queryClient.ts
    pages/         # Route components (ChatPage, LoginPage, SignUpPage, etc.)
    App.tsx        # Main routing and providers
    main.tsx       # Entry point
  public/
    figmaAssets/   # Design assets
  index.html
vite.config.ts     # Port 5000, host 0.0.0.0, allowedHosts: true
tailwind.config.ts
package.json
```

## Development
- Run: `npm run dev` (starts Vite dev server on port 5000)
- Build: `npm run build`

## Features
- User authentication (login/register/logout)
- AI-powered code analysis
- Real-time conversation system
- file management
- Submission tracking and history

