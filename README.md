# Mesmerism Web

A competitive YouTube creator voting platform built with Next.js 15, featuring real-time competitions, coin-based voting system, and live chat functionality.

## Overview

Mesmerism is a social media influencer competition platform where users support their favorite YouTube creators through a coin-based voting system during weekly competitions. The platform features a 15,000,000 cash prize pool and real-time leaderboards with gaming-inspired UI elements.

## Key Features

### 🏆 Competition System

- **Weekly Competitions**: 4-week competition cycles with real-time leaderboards
- **Creator Rankings**: Live percentage-based rankings with visual fire effects for top performers
- **Prize Pool**: 15,000,000 cash prize distribution system
- **Participant Management**: Admin tools for managing competition participants

### 💰 Coin Economy

- **Digital Currency**: Coin-based voting system with real money purchases
- **Payment Integration**: Secure coin topup system with transaction tracking
- **Vote Purchasing**: Users spend coins to vote for their favorite creators
- **Balance Management**: Real-time coin balance display and transaction history

### 👥 User Management

- **Role-Based Access**: Admin, Moderator, and Creator roles with specific permissions
- **Creator Profiles**: Comprehensive profiles with social links, descriptions, and subscriber counts
- **User Moderation**: Advanced suspension and ban management system
- **Authentication**: Secure login/register system with Supabase

### 💬 Real-time Communication

- **Live Chat**: Real-time chat system with mobile-responsive design
- **Event Broadcasting**: Live updates for votes, payments, and user activities
- **System Announcements**: Platform-wide messaging capability
- **Mobile Chat**: Floating action button with unread message notifications

### 🛠️ Admin Dashboard

- **Week Management**: Create and manage competition weeks
- **User Administration**: Comprehensive user management with search and pagination
- **Transaction Monitoring**: View user transactions and voting history
- **Moderation Tools**: Role assignment, user suspension, and ban management

## Tech Stack

- **Framework**: Next.js 15.4.5 with App Router and Turbopack
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL with Supabase and Drizzle ORM
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: Radix UI for accessible components
- **Icons**: Lucide React and custom SVG icons
- **Real-time**: Supabase real-time subscriptions
- **Authentication**: Supabase Auth with custom user management
- **State Management**: SWR for data fetching and caching
- **Animations**: Framer Motion and Lottie React

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mesmerism-web
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
mesmerism-web/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── users/         # User management
│   │   ├── weeks/         # Competition week management
│   │   └── profile/       # User profile management
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page and actions
│   │   └── register/      # Registration page and actions
│   ├── api/               # API routes
│   │   ├── coins/         # Coin balance endpoints
│   │   └── user/          # User data endpoints
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components (buttons, dialogs, etc.)
│   ├── icons/            # Custom SVG icons and animations
│   ├── modals/           # Modal components for various features
│   ├── livechat.tsx      # Real-time chat components
│   ├── banner.tsx        # Competition banner
│   ├── prize.tsx         # Prize pool display
│   └── youtubelist.tsx   # Creator leaderboard
├── lib/                  # Utility functions and configurations
│   ├── db/               # Database schema, queries, and migrations
│   ├── auth/             # Authentication middleware
│   └── supabase/         # Supabase client configuration
├── hooks/                # Custom React hooks
└── public/               # Static assets (images, icons)
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:setup` - Setup database schema
- `npm run db:seed` - Seed database with initial data
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management

## Database Schema

The application uses PostgreSQL with the following main entities:

- **users**: User accounts with authentication and profile data
- **profiles**: Extended creator profiles with social links and descriptions
- **competition_weeks**: Weekly competition periods with start/end dates
- **vote_orders**: User votes for creators with coin transactions
- **coin_ledger**: Transaction history for coin purchases and spending
- **coin_topups**: Payment records for coin purchases
- **messages**: Real-time chat messages with moderation features
- **user_roles**: Role-based access control (admin, moderator, creator)
- **user_suspensions**: User moderation and ban management

## Development Setup

1. **Environment Variables**: Set up Supabase credentials and database connection
2. **Database**: Run `npm run db:setup` to initialize the database schema
3. **Seed Data**: Use `npm run db:seed` to populate initial data
4. **Real-time**: Configure Supabase real-time subscriptions for live updates

## Key Development Features

- **Real-time Updates**: Live leaderboard and chat using Supabase subscriptions
- **Type Safety**: Full TypeScript coverage with Drizzle ORM
- **Mobile-First**: Responsive design with mobile-optimized components
- **Gaming UI**: Custom animations and visual effects for competition elements
- **Modular Architecture**: Component-based structure with clear separation of concerns

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS
- [Radix UI Documentation](https://www.radix-ui.com/) - learn about Radix UI components

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

This project is currently in beta. Contributions are welcome!

## License

This project is private and proprietary.
