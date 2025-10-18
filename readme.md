# Influencer Admin Dashboard

A modern web application built with Next.js for managing influencer partnerships, referrals, and administrative tasks. This dashboard provides separate interfaces for administrators and partners, featuring user management, referral tracking, performance analytics, and more.

## Overview

This project is a comprehensive influencer management platform that allows:

-   **Administrators** to oversee all partners, users, and referrals across the system
-   **Partners** (influencers) to manage their own referrals, view performance reports, and access personalized dashboards
-   Secure authentication with role-based access control
-   Responsive design optimized for both desktop and mobile devices

## Tech Stack

-   **Framework**: Next.js 15 with App Router
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS with custom design system
-   **UI Components**: shadcn/ui (Radix UI primitives)
-   **Icons**: Lucide React
-   **Forms**: React Hook Form with Zod validation
-   **Charts**: Recharts for data visualization
-   **Package Manager**: pnpm
-   **Deployment**: Vercel (with Analytics)

## Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin-specific pages
│   │   ├── influencers/          # Influencer management
│   │   ├── referrals/            # Referral oversight
│   │   ├── users/                # User management
│   │   └── page.tsx              # Admin dashboard
│   ├── login/                    # Authentication pages
│   │   ├── admin/                # Admin login
│   │   └── influencer/           # Partner login
│   ├── partners/                 # Partner-specific pages
│   │   ├── add/                  # Add new referrals
│   │   ├── magic-link/           # Magic link functionality
│   │   ├── my-referrals/         # Partner's referrals
│   │   ├── performance-report/   # Performance analytics
│   │   ├── referrals/            # Referral management
│   │   ├── settings/             # Partner settings
│   │   └── page.tsx              # Partner dashboard
│   ├── signup/                   # User registration
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable UI components
│   ├── auth/                     # Authentication forms
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── dashboard-shell.tsx   # Main dashboard layout
│   │   ├── navbar.tsx            # Top navigation
│   │   ├── sidebar.tsx           # Side navigation
│   │   └── stats-card.tsx        # Statistics display
│   ├── theme-provider.tsx        # Theme management
│   └── ui/                       # shadcn/ui components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication logic
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
└── styles/                       # Additional stylesheets
```

## Features

### Authentication & Authorization

-   Role-based access control (Admin/Partner)
-   Secure login with email/password
-   Session management via localStorage
-   Automatic redirects based on user role

### Admin Dashboard

-   Overview of all system metrics
-   Partner management and monitoring
-   User administration across the platform
-   Comprehensive referral tracking and analytics

### Partner Dashboard

-   Personalized performance metrics
-   Referral management (view, add, track)
-   Performance reports and analytics
-   Account settings and profile management

### UI/UX Features

-   Responsive design for all screen sizes
-   Dark/light theme support (via next-themes)
-   Accessible components using Radix UI
-   Smooth animations and transitions
-   Mobile-friendly sidebar navigation

## Getting Started

### Prerequisites

-   Node.js 18+
-   pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd influencer-admin-dashboard
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Authentication

The application uses a simple authentication system with predefined users:

-   **Admin**: `admin@123.com` / `123456`
-   **Partner**: `inf@123.com` / `123456`

_Note: This is a demo authentication system. In production, implement proper authentication with a backend service._

### Supabase Login Function (Server Proxy)

The login form posts to a local API route at `/api/login` which proxies to your Supabase Edge Function.

Configure the required environment variable so the server can authenticate to Supabase:

1. Create a `.env.local` file in the project root with:

```
SUPABASE_FUNCTION_BEARER=Bearer <YOUR_SUPABASE_FUNCTION_JWT>
SUPABASE_FUNCTION_URL=https://rybcqxzqpykgpgfngakv.supabase.co/functions/v1/custom-login
SUPABASE_ADMIN_TOKEN=Bearer <YOUR_ADMIN_JWT>
SUPABASE_GET_PARTNERS_URL=https://rybcqxzqpykgpgfngakv.supabase.co/functions/v1/get-all-partners
SUPABASE_ALL_GET_USERS_URL=https://rybcqxzqpykgpgfngakv.supabase.co/functions/v1/get-all-users
SUPABASE_CREATE_PARTNER_URL=https://rybcqxzqpykgpgfngakv.supabase.co/functions/v1/create-partner
```

2. Restart the dev server after adding or changing the env file.

Notes:

-   Using `SUPABASE_FUNCTION_BEARER` keeps the secret on the server only. Avoid exposing it with `NEXT_PUBLIC_`.
-   If both are defined, the server uses `SUPABASE_FUNCTION_BEARER` in preference to `NEXT_PUBLIC_SUPABASE_FUNCTION_BEARER`.
-   The `SUPABASE_FUNCTION_URL` defaults to the provided URL if not set.
-   The body posted by the client is:
    -   `{ email: string, password: string, user_type: "admin" | "partner" }`
-   The expected response from Supabase is `{ token: string, role: "admin" | "partner" }`.

## Key Components

### DashboardShell

The main layout component that wraps all dashboard pages. It includes:

-   Responsive navbar with sidebar toggle
-   Role-based sidebar navigation
-   Custom CSS variable overrides for theming

### Authentication Forms

-   Login forms for both admin and partner roles
-   Form validation using React Hook Form and Zod
-   Automatic role-based redirection after login

### UI Component Library

Comprehensive set of reusable components built on Radix UI:

-   Form controls (inputs, selects, checkboxes)
-   Layout components (cards, sheets, dialogs)
-   Data display (tables, charts, badges)
-   Navigation (menus, tabs, breadcrumbs)

## Development

### Scripts

-   `pnpm dev` - Start development server
-   `pnpm build` - Build for production
-   `pnpm start` - Start production server
-   `pnpm lint` - Run ESLint

### Code Style

-   TypeScript for type safety
-   ESLint for code quality
-   Tailwind CSS for consistent styling
-   Component-based architecture

## Deployment

This application is configured for deployment on Vercel with:

-   Automatic deployments from main branch
-   Analytics integration
-   Optimized build settings

## Contributing

1. Follow the existing code style and architecture
2. Use TypeScript for all new code
3. Test components and pages thoroughly
4. Ensure responsive design on all screen sizes
5. Update documentation as needed

## License

This project is private and proprietary.
