# Mesmerism Web

A modern web application built with Next.js 15, featuring a sleek UI with authentication, coin system, and responsive design.

## Features

- **Next.js 15** with App Router and Turbopack
- **Modern UI** with Radix UI components and Tailwind CSS
- **Authentication** system with login and register pages
- **Coin System** with user balance display
- **Responsive Design** optimized for all devices
- **TypeScript** for type safety and better development experience

## Tech Stack

- **Framework**: Next.js 15.4.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Build Tool**: Turbopack

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
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components (buttons, dialogs, etc.)
│   ├── icons/            # Custom icons
│   └── header.tsx        # Main header component
├── lib/                  # Utility functions
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development

The application uses:

- **App Router** for file-based routing
- **Turbopack** for faster development builds
- **Tailwind CSS v4** for styling
- **Radix UI** for accessible components
- **TypeScript** for type safety

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
